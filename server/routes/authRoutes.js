const express = require('express');
const router = express.Router();
const { loginUser, updateTheme } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.patch('/theme', protect, updateTheme);

module.exports = router;
