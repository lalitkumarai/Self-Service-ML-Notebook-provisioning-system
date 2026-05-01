const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parse/sync');
const Dataset = require('../models/Dataset');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../notebook_data/datasets');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (['.csv', '.json', '.txt'].includes(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV, JSON, and TXT files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// POST /api/datasets/upload
const uploadDataset = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    let rows = 0, columns = 0, preview = [], headers = [];

    if (path.extname(req.file.originalname).toLowerCase() === '.csv') {
      const content = fs.readFileSync(req.file.path, 'utf8');
      const records = csv.parse(content, { columns: true, skip_empty_lines: true, to: 6 });
      if (records.length > 0) {
        headers = Object.keys(records[0]);
        columns = headers.length;
        preview = records.slice(0, 5).map(r => Object.values(r));
      }
      // Count total rows without loading all into memory
      const totalContent = fs.readFileSync(req.file.path, 'utf8');
      rows = (totalContent.match(/\n/g) || []).length;
    }

    const dataset = await Dataset.create({
      userId: req.user._id,
      name: req.body.name || req.file.originalname.replace(/\.[^/.]+$/, ''),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      rows,
      columns,
      preview,
      headers,
    });

    res.status(201).json({ success: true, dataset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/datasets
const getDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, datasets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/datasets/:id
const deleteDataset = async (req, res) => {
  try {
    const ds = await Dataset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!ds) return res.status(404).json({ success: false, message: 'Not found' });
    // Remove from disk
    if (fs.existsSync(ds.path)) fs.unlinkSync(ds.path);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { upload, uploadDataset, getDatasets, deleteDataset };
