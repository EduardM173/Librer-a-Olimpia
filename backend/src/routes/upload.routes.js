// routes/upload.routes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 📂 Carpeta destino (dentro del frontend)
const uploadPath = path.join(__dirname, '../../frontend/public/IMG');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// ⚙️ Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `prod-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // máx 5 MB
});

// 📸 Ruta de subida
router.post('/upload/image', upload.single('imagen'), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: 'no_file', message: 'No se subió ninguna imagen.' });

  // Devuelve la ruta relativa que se guardará en BD
  const relativePath = `/IMG/${req.file.filename}`;
  res.json({ imagePath: relativePath });
});

module.exports = router;
