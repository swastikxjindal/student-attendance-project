const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        console.log('Connected to MySQL...');

        // Database
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.query(`USE ${process.env.DB_NAME}`);

        // Tables
        const tables = [
            `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user1') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id VARCHAR(50) UNIQUE,
                name VARCHAR(100) NOT NULL,
                department VARCHAR(50),
                position VARCHAR(50),
                contact VARCHAR(50),
                password VARCHAR(255),
                manager_id INT, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                date DATE NOT NULL,
                status ENUM('present', 'absent', 'leave') NOT NULL,
                marked_by INT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_attendance (employee_id, date)
            )`,
            `CREATE TABLE IF NOT EXISTS leaves (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                type ENUM('Sick', 'Casual', 'Earned', 'Other') NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                reason TEXT,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const table of tables) {
            await connection.query(table);
        }
        console.log('Tables verified.');

        // Clear existing data to ensure fresh seed
        await connection.query('DELETE FROM leaves');
        await connection.query('DELETE FROM attendance');
        await connection.query('DELETE FROM employees');
        await connection.query('DELETE FROM users');
        console.log('Cleared existing data.');

        // Users
        const adminHash = await bcrypt.hash('admin123', 10);
        const user1Hash = await bcrypt.hash('user123', 10);

        await connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', adminHash, 'admin']);
        const [user1Result] = await connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['user1', user1Hash, 'user1']);
        const user1Id = user1Result.insertId;
        const [adminResult] = await connection.query('SELECT id FROM users WHERE username = "admin"');
        const adminId = adminResult[0].id;
        console.log('Users seeded.');

        // Employees
        const employees = [
            ['John Doe', 'Sales', 'Manager', '1234567890'],
            ['Jane Smith', 'Sales', 'Executive', '0987654321'],
            ['Alice Johnson', 'IT', 'Developer', '1122334455'],
            ['Bob Brown', 'IT', 'Designer', '5544332211'],
            ['Charlie Davis', 'HR', 'Recruiter', '6677889900'],
            ['Diana Evans', 'HR', 'Manager', '9988776655'],
            ['Evan Foster', 'Marketing', 'Lead', '5566778899'],
            ['Frank Green', 'Marketing', 'Analyst', '1112223334'],
            ['Grace Hall', 'Finance', 'Accountant', '4443332221'],
            ['Henry Irving', 'Finance', 'Auditor', '7778889990']
        ];

        const empIds = [];
        for (let i = 0; i < employees.length; i++) {
            const [emp] = employees[i];
            const empIdStr = `EMP${String(i + 1).padStart(3, '0')}`;
            const [res] = await connection.query(
                'INSERT INTO employees (name, department, position, contact, manager_id, employee_id) VALUES (?, ?, ?, ?, ?, ?)',
                [...employees[i], user1Id, empIdStr]
            );
            empIds.push(res.insertId);
        }
        console.log('Employees seeded.');

        // Attendance (for today)
        const today = new Date().toISOString().split('T')[0];
        for (const empId of empIds) {
            const status = Math.random() > 0.2 ? 'present' : 'absent';
            await connection.query(
                'INSERT INTO attendance (employee_id, date, status, marked_by) VALUES (?, ?, ?, ?)',
                [empId, today, status, user1Id]
            );
        }
        console.log('Attendance seeded.');

        // Leaves
        const leaveTypes = ['Sick', 'Casual', 'Earned'];
        for (let i = 0; i < 3; i++) {
            const empId = empIds[i];
            const type = leaveTypes[i % 3];
            const startDate = today;
            const endDate = today;
            const reason = 'Feeling unwell' + (i > 0 ? ' and need rest' : '');
            await connection.query(
                'INSERT INTO leaves (employee_id, type, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
                [empId, type, startDate, endDate, reason, 'pending']
            );
        }
        console.log('Leaves seeded.');

        console.log('--- SEEDING COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
};

seed();
