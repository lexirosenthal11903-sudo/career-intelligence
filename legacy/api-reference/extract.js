import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'File parse error' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file received' });
    }

    const ext = path.extname(file.originalFilename || '').toLowerCase();
    const buffer = fs.readFileSync(file.filepath);

    try {
      let text = '';

      if (ext === '.pdf') {
        const { extractText } = await import('unpdf');
        const result = await extractText(new Uint8Array(buffer), { mergePages: true });
        text = result.text;
      } else if (ext === '.docx') {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } else {
        return res.status(400).json({ error: 'Unsupported file type' });
      }

      const cleaned = text.replace(/\s{3,}/g, '\n').trim();
      return res.status(200).json({ text: cleaned });

    } catch (e) {
      return res.status(500).json({ error: 'Extraction failed', detail: e.message });
    }
  });
}
