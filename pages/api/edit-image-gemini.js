/* eslint-disable @typescript-eslint/no-require-imports */
import { GoogleGenAI } from '@google/genai';
import path from 'path';
const formidable = require("formidable");
import fs from 'fs';

// 取得 service account JSON
const credentialString = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const credentialJson = credentialString ? JSON.parse(credentialString) : null;

// GCS Storage 初始化（仍用 service account json）
import { Storage } from '@google-cloud/storage';
const storage = credentialJson
  ? new Storage({ projectId: credentialJson.project_id, credentials: credentialJson })
  : new Storage();

// GoogleGenAI 改用 API KEY 初始化（不能同時傳 project/location）
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
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
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }
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
  let uploadedFiles = [];
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

    // 上傳到 GCS 並補上 fileUri，同時記錄 destFileName
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

    // 組合多 part prompt，改為 base64 inlineData
    const promptParts = [];
    if (selfiePart) {
      const selfieBuffer = fs.readFileSync(selfiePart.localFilePath);
      promptParts.push({ text: "This is the user's selfie. Please use this face and body as the main subject:" });
      promptParts.push({ inlineData: { data: selfieBuffer.toString('base64'), mimeType: selfiePart.fileData.mimeType } });
    }
    if (clothesParts.length > 0) {
      promptParts.push({ text: "These are the clothes and accessories the user wants to wear. Please dress the main subject naturally with these items:" });
      for (let part of clothesParts) {
        const clothBuffer = fs.readFileSync(part.localFilePath);
        promptParts.push({ inlineData: { data: clothBuffer.toString('base64'), mimeType: part.fileData.mimeType } });
      }
    }
    if (locationPart) {
      const locationBuffer = fs.readFileSync(locationPart.localFilePath);
      promptParts.push({ text: "This is a representative photo of the travel destination. Please naturally composite the main subject into this scene:" });
      promptParts.push({ inlineData: { data: locationBuffer.toString('base64'), mimeType: locationPart.fileData.mimeType } });
    }
    promptParts.push({ text: `
Combine the provided face and outfit onto a realistic human figure and place them naturally at the given location. 
Make sure the composition shows the full body (head to feet) clearly, centered in the frame, with natural proportions and lighting that matches the background. 
The final image should look like an authentic scene at this location.` });

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
    // 新增：AI 生成完畢後，刪除剛剛上傳的 GCS 檔案
    await Promise.all(
      uploadedFiles.map(filename =>
        storage.bucket(bucketName).file(filename).delete().catch(() => {})
      )
    );
  }
} 