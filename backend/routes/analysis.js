const express = require('express');
const router = express.Router();
const { getAnalysis, getAllAnalyses } = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAllAnalyses);
router.get('/:cropDataId', getAnalysis);

module.exports = router;
