const express = require('express');
const router = express.Router();
const docController = require('../controllers/docController');

router.get('/:scanId', docController.getDocs);

module.exports = router;
