const db = require('../config/db');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (User1 only)
const markAttendance = async (req, res) => {
    const { employeeId, date, status } = req.body;

    if (req.user.role !== 'user1') {
        return res.status(403).json({ message: 'Only User1 can mark attendance' });
    }

    try {
        // Validation: Check if employee belongs to user1? 
        // Requirement says "assigned employees". 
        // We can enforce that only manager_id = req.user.id can mark.

        const [emp] = await db.query('SELECT * FROM employees WHERE id = ? AND manager_id = ?', [employeeId, req.user.id]);
        if (emp.length === 0) {
            return res.status(404).json({ message: 'Employee not found or not assigned to you' });
        }

        /* 
           Using ON DUPLICATE KEY UPDATE to allow updating status for the same day 
           if marked incorrectly, or we can just insert and fail if exists.
           Let's allow update for better UX.
        */
        await db.query(`
            INSERT INTO attendance (employee_id, date, status, marked_by)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by), timestamp = CURRENT_TIMESTAMP
        `, [employeeId, date, status, req.user.id]);

        res.status(201).json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private (Admin & User1)
const getAttendance = async (req, res) => {
    try {
        let query = `
            SELECT a.*, e.name as employee_name, e.department, e.position 
            FROM attendance a 
            JOIN employees e ON a.employee_id = e.id
        `;
        let params = [];

        // Admin sees all. User1 sees only their employees' attendance?
        // Requirement: "Admin dashboard... attendance records".
        // "user1 dashboard ... attendance marking feature". 
        // Doesn't strictly say user1 needs to see history list, but useful to return today's status at least.

        if (req.user.role === 'user1') {
            // Maybe just for today? Or all history for their employees?
            // Let's filter by manager_id for safety.
            query += ' WHERE e.manager_id = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY a.date DESC, a.timestamp DESC';

        const [records] = await db.query(query, params);
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { markAttendance, getAttendance };
