const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 📂 Ruta física donde se guardarán las imágenes
const uploadPath = path.join(__dirname, '../../frontend/public/IMG');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// ⚙️ Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `prod-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Tipo de archivo no permitido. Solo .png, .jpg, .jpeg, .webp.'));
    }
    cb(null, true);
  },
});

exports.uploadImage = [
  upload.single('imagen'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'no_file', message: 'No se subió ninguna imagen.' });
    }

    // Guardar la ruta relativa para BD
    const relativePath = `/IMG/${req.file.filename}`;
    res.json({ imagePath: relativePath });
  },
];
