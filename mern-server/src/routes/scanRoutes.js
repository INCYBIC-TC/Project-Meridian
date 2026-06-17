const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

router.post('/init', scanController.initScan);

module.exports = router;
