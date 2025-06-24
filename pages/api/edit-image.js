/* eslint-disable @typescript-eslint/no-require-imports */
const OpenAI = require("openai").default;
const { toFile } = require("openai");
const fs = require("fs");
const formidable = require("formidable");

export const config = {
  api: { 
    bodyParser: false
  },
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const client = new OpenAI({ apiKey });

export default async function handler(req, res) {
  // 設置 CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.');
    }
    
    const { fields, files } = await parseForm(req);
    let prompt = fields.prompt;
    if (Array.isArray(prompt)) {
      prompt = prompt[0];
    }
    
    // 處理上傳的圖片
    const imagesArr = Array.isArray(files.images) ? files.images : [files.images];
    const images = await Promise.all(
      imagesArr.map(async (img) =>
        await toFile(fs.createReadStream(img.filepath), img.originalFilename, {
          type: img.mimetype,
        })
      )
    );
    
    console.log('Using gpt-image-1 model for multiple images...');
    console.log('Number of images:', images.length);
    console.log('Prompt:', prompt.substring(0, 200) + '...');
    
    // 使用 gpt-image-1 模型支援多張圖片
    const rsp = await client.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt,
      size: "1024x1536",
      quality: "high",
      output_format: "png"
    });

    console.log('OpenAI response structure:', JSON.stringify(rsp, null, 2));
    
    // The response might contain a URL instead of base64
    if (!rsp.data?.[0]) {
      throw new Error("No image generated from OpenAI");
    }

    // Check if we have b64_json or need to fetch from URL
    let image_base64;
    if (rsp.data[0].b64_json) {
      image_base64 = rsp.data[0].b64_json;
    } else if (rsp.data[0].url) {
      // If we get a URL, we need to fetch the image and convert to base64
      const imageResponse = await fetch(rsp.data[0].url);
      const buffer = await imageResponse.arrayBuffer();
      image_base64 = Buffer.from(buffer).toString('base64');
    } else {
      throw new Error("No valid image data in OpenAI response");
    }
    
    res.status(200).json({ imageBase64: image_base64 });
  } catch (err) {
    console.error('OpenAI API Error:', err);
    res.status(500).json({ 
      error: err.message || String(err),
      details: err.response?.data || 'No additional details available'
    });
  }
}
