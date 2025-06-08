import { GoogleGenAI } from '@google/genai';
const formidable = require("formidable");
import fs from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';

// 寫入暫存檔案並設 GOOGLE_APPLICATION_CREDENTIALS
if (
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON &&
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim().startsWith('{')
) {
  const keyPath = path.resolve('.google-service-account.json');
  fs.writeFileSync(keyPath, process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
}

const ai = new GoogleGenAI({
  vertexai: true,
  project: 'ai-outfit-462213',
  location: 'global',
});
const model = 'gemini-2.0-flash-preview-image-generation';

const generationConfig = {
  maxOutputTokens: 8192,
  temperature: 1,
  topP: 0.95,
  responseModalities: ["TEXT", "IMAGE"],
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_IMAGE_HATE', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_IMAGE_HARASSMENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT', threshold: 'OFF' },
  ],
};

export const config = {
  api: { bodyParser: false },
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

// GCS 設定
const bucketName = 'user_upload_photos';
const storage = new Storage();

async function uploadToGCS(localFilePath, destFileName, mimetype) {
  await storage.bucket(bucketName).upload(localFilePath, {
    destination: destFileName,
    metadata: {
      contentType: mimetype,
    },
  });
  return `gs://${bucketName}/${destFileName}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { fields, files } = await parseForm(req);
    let prompt = fields.prompt;
    if (Array.isArray(prompt)) {
      prompt = prompt[0];
    }
    const imagesArr = Array.isArray(files.images) ? files.images : [files.images];

    // 將所有圖片上傳到 GCS 並取得 gs:// 路徑
    const imageParts = await Promise.all(
      imagesArr.map(async (img, idx) => {
        const destFileName = `gemini_uploads/${Date.now()}_${idx}_${path.basename(img.originalFilename)}`;
        const gcsUri = await uploadToGCS(img.filepath, destFileName, img.mimetype);
        return {
          fileData: {
            fileUri: gcsUri,
            mimeType: img.mimetype,
          },
        };
      })
    );

    // Debug log: 檢查 imageParts
    console.log('imageParts:', imageParts);

    // 組合 Gemini 請求
    const reqBody = {
      model,
      contents: [
        { role: 'user', parts: [...imageParts, { text: prompt }] },
      ],
      config: generationConfig,
    };

    const streamingResp = await ai.models.generateContentStream(reqBody);
    let imageBase64 = '';
    for await (const chunk of streamingResp) {
      if (chunk.candidates && chunk.candidates[0].content.parts) {
        const imgPart = chunk.candidates[0].content.parts.find(
          (p) => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('image/')
        );
        if (imgPart) imageBase64 = imgPart.inlineData.data;
      }
    }
    if (imageBase64) {
      res.status(200).json({ imageBase64 });
    } else {
      res.status(500).json({ error: 'AI 生成失敗' });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
} 