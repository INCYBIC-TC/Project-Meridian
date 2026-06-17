const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
