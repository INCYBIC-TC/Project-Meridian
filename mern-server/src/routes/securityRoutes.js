const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

router.get('/:scanId', securityController.getSecurityReport);

module.exports = router;
