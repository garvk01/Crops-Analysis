const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadData, loadDemo, getAllData, getDataById, deleteData } = require('../controllers/dataController');
const { protect } = require('../middleware/auth');

// Multer config - store in memory, accept CSV only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

router.use(protect); // All data routes require auth

router.get('/', getAllData);
router.get('/:id', getDataById);
router.post('/upload', upload.single('file'), uploadData);
router.post('/demo', loadDemo);
router.delete('/:id', deleteData);

module.exports = router;
