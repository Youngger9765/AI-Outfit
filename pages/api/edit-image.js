/* eslint-disable @typescript-eslint/no-require-imports */
const OpenAI = require("openai").default;
const toFile = require("openai").toFile;
const fs = require("fs");
const formidable = require("formidable");

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

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { fields, files } = await parseForm(req);
    let prompt = fields.prompt;
    if (Array.isArray(prompt)) {
      prompt = prompt[0];
    }
    const imagesArr = Array.isArray(files.images) ? files.images : [files.images];

    const images = await Promise.all(
      imagesArr.map(async (img) =>
        await toFile(fs.createReadStream(img.filepath), img.originalFilename, {
          type: img.mimetype,
        })
      )
    );

    const rsp = await client.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt,
    });

    const image_base64 = rsp.data[0].b64_json;
    res.status(200).json({ imageBase64: image_base64 });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
