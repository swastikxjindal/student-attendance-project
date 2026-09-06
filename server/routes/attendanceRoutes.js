const express = require('express');

const router = express.Router();

const {
    markAttendance,
    getAttendance,
    getAttendanceSummary
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/authMiddleware');


// ==========================================
// Attendance Routes
// ==========================================

// GET  /api/attendance
// POST /api/attendance
router.route('/')
    .get(protect, getAttendance)
    .post(protect, markAttendance);


// ==========================================
// Attendance Summary
// ==========================================

// GET /api/attendance/summary/:employeeId
router.get(
    '/summary/:employeeId',
    protect,
    getAttendanceSummary
);


module.exports = router;