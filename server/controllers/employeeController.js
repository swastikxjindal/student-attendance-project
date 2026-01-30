const db = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res) => {
    try {
        let query = 'SELECT * FROM employees';
        let params = [];

        if (req.user.role === 'user1') {
            query += ' WHERE manager_id = ?';
            params.push(req.user.id);
        }

        const [employees] = await db.query(query, params);
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private (Admin only)
const createEmployee = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { name, employee_id, department, position, contact, password } = req.body;

        // Validate required fields
        if (!name || !department || !position || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if employee_id already exists (if provided)
        if (employee_id) {
            const [existing] = await connection.query('SELECT id FROM employees WHERE employee_id = ?', [employee_id]);
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Employee ID already exists' });
            }
        }

        // Check if username (name) already exists in users table to prevent login conflicts
        const [existingUser] = await connection.query('SELECT id FROM users WHERE username = ?', [name]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'A user with this name already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 1. Create User record for login
        const [userResult] = await connection.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [name, hashedPassword, 'user1']
        );

        // 2. Insert the new employee with the user_id as manager_id's reference or keep it as is
        // Actually, employees table id is separate.
        const query = `
            INSERT INTO employees (employee_id, name, department, position, contact, password, manager_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.query(query, [
            employee_id || null,
            name,
            department,
            position,
            contact || null,
            hashedPassword,
            req.user.id
        ]);

        await connection.commit();

        // Fetch the newly created employee
        const [newEmployee] = await connection.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            employee: newEmployee[0]
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create employee error:', error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;

        // Fetch employee to get the name for user deletion
        const [employee] = await connection.query('SELECT name FROM employees WHERE id = ?', [id]);

        if (employee.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const employeeName = employee[0].name;

        // 1. Delete from attendance records first (foreign key or just to clean up)
        await connection.query('DELETE FROM attendance WHERE employee_id = ?', [id]);

        // 2. Delete from employees table
        await connection.query('DELETE FROM employees WHERE id = ?', [id]);

        // 3. Delete from users table (if exists)
        await connection.query('DELETE FROM users WHERE username = ? AND role = "user1"', [employeeName]);

        await connection.commit();
        res.json({ message: 'Employee removed successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Delete employee error:', error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private (Admin only)
const updateEmployee = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;
        const { name, employee_id, department, position, contact } = req.body;

        // Fetch original employee to see if name changed
        const [original] = await connection.query('SELECT name FROM employees WHERE id = ?', [id]);
        if (original.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        const oldName = original[0].name;

        // Update employees table
        await connection.query(
            'UPDATE employees SET name = ?, employee_id = ?, department = ?, position = ?, contact = ? WHERE id = ?',
            [name, employee_id, department, position, contact, id]
        );

        // Update users table if name changed
        if (name !== oldName) {
            await connection.query(
                'UPDATE users SET username = ? WHERE username = ? AND role = "user1"',
                [name, oldName]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Employee updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update employee error:', error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee };

