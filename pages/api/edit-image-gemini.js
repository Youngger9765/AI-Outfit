/* eslint-disable @typescript-eslint/no-require-imports */
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
  const keyPath = path.resolve('/tmp/.google-service-account.json');
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
  const uploadedFiles = [];
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
    // 先分類：自拍照、衣服、地點
    let selfiePart = null;
    let clothesParts = [];
    let locationPart = null;
    imagesArr.forEach((img, idx) => {
      const name = img.originalFilename?.toLowerCase() || '';
      if (name.includes('selfie')) {
        selfiePart = {
          fileData: {
            fileUri: '', // 之後補上
            mimeType: img.mimetype,
          },
          localFilePath: img.filepath,
          destFileName: `gemini_uploads/${Date.now()}_selfie_${path.basename(img.originalFilename)}`,
        };
      } else if (name.includes('location')) {
        locationPart = {
          fileData: {
            fileUri: '', // 之後補上
            mimeType: img.mimetype,
          },
          localFilePath: img.filepath,
          destFileName: `gemini_uploads/${Date.now()}_location_${path.basename(img.originalFilename)}`,
        };
      } else {
        clothesParts.push({
          fileData: {
            fileUri: '', // 之後補上
            mimeType: img.mimetype,
          },
          localFilePath: img.filepath,
          destFileName: `gemini_uploads/${Date.now()}_cloth_${idx}_${path.basename(img.originalFilename)}`,
        });
      }
    });

    // 上傳到 GCS 並補上 fileUri
    if (selfiePart) {
      selfiePart.fileData.fileUri = await uploadToGCS(selfiePart.localFilePath, selfiePart.destFileName, selfiePart.fileData.mimeType);
      uploadedFiles.push(selfiePart.destFileName);
    }
    for (let part of clothesParts) {
      part.fileData.fileUri = await uploadToGCS(part.localFilePath, part.destFileName, part.fileData.mimeType);
      uploadedFiles.push(part.destFileName);
    }
    if (locationPart) {
      locationPart.fileData.fileUri = await uploadToGCS(locationPart.localFilePath, locationPart.destFileName, locationPart.fileData.mimeType);
      uploadedFiles.push(locationPart.destFileName);
    }

    // 組合多 part prompt
    const promptParts = [];
    if (selfiePart) {
      promptParts.push({ text: '這是使用者的自拍照，請務必完全保持臉部特徵的一致性：' });
      promptParts.push({ fileData: selfiePart.fileData });
    }
    if (clothesParts.length > 0) {
      promptParts.push({ text: '以下是使用者想要穿搭的衣服與配件照片，請將這些單品自然地穿在主角身上：' });
      for (let part of clothesParts) {
        promptParts.push({ fileData: part.fileData });
      }
    }
    if (locationPart) {
      promptParts.push({ text: '這是旅遊地點的代表照片，請將主角自然地合成在這個場景中：' });
      promptParts.push({ fileData: locationPart.fileData });
    }
    promptParts.push({ text: `\n
      CRITICAL PRIORITY - FACIAL SIMILARITY:
      The generated face MUST be an EXACT REPLICA of the provided selfie photo.
      - Maintain precise facial features, proportions, and unique characteristics
      - Copy exact eye shape, size, and position
      - Match nose structure and mouth details perfectly
      - Preserve skin tone and complexion exactly
      - Keep identical facial expression
      - Ensure same head tilt and angle
      
      Secondary Priorities:
      1. Combine the provided outfit onto the figure naturally
      2. Place the person in the given location with appropriate lighting and perspective
      3. Ensure the composition shows the full body clearly and centered
      
      The final result should look like the exact same person from the selfie, just in a different outfit and location.
      This is ABSOLUTELY CRITICAL - the face must be indistinguishable from the original selfie.` });

    // Debug log: 檢查 promptParts
    console.log('promptParts:', promptParts);

    // 組合 Gemini 請求
    const reqBody = {
      model,
      contents: [
        { role: 'user', parts: promptParts },
      ],
      config: generationConfig,
    };

    // 改用 generateContent（非串流）
    const response = await ai.models.generateContent(reqBody);
    let imageBase64 = '';
    if (response.candidates && response.candidates[0].content.parts) {
      const imgPart = response.candidates[0].content.parts.find(
        (p) => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('image/')
      );
      if (imgPart) imageBase64 = imgPart.inlineData.data;
    }
    if (imageBase64) {
      res.status(200).json({ imageBase64 });
    } else {
      res.status(500).json({ error: 'AI 生成失敗' });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  } finally {
    // 刪除所有剛剛上傳到 GCS 的圖片
    await Promise.all(
      uploadedFiles.map(filename =>
        storage.bucket(bucketName).file(filename).delete().catch((err) => {
          console.error('刪除檔案失敗：', filename, err);
        })
      )
    );
  }
} 