const express = require('express');
const router  = express.Router();
const { getInsights, refreshInsights } = require('../controllers/insightsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/:cropDataId',          getInsights);
router.post('/:cropDataId/refresh', refreshInsights);

module.exports = router;
