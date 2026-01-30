const db = require('../config/db');

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res) => {
    try {
        let query = `
            SELECT l.*, e.name as employee_name 
            FROM leaves l 
            JOIN employees e ON l.employee_id = e.id
        `;
        let params = [];

        if (req.user.role === 'user1') {
            query += ' WHERE e.manager_id = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY l.created_at DESC';

        const [leaves] = await db.query(query, params);
        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a leave request
// @route   POST /api/leaves
// @access  Private
exports.createLeave = async (req, res) => {
    const { employeeId, type, startDate, endDate, reason } = req.body;

    if (!employeeId || !type || !startDate || !endDate) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO leaves (employee_id, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
            [employeeId, type, startDate, endDate, reason]
        );

        const [newLeave] = await db.query('SELECT * FROM leaves WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            data: newLeave[0]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id
// @access  Private (Admin)
exports.updateLeaveStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        await db.query('UPDATE leaves SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ success: true, message: 'Leave status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
