const express = require('express');
const router = express.Router();
const { getLeaves, createLeave, updateLeaveStatus } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLeaves);
router.post('/', protect, createLeave);
router.put('/:id', protect, updateLeaveStatus);

module.exports = router;
