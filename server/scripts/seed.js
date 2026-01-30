const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config(); // defaults to .env in cwd (d:/newkar/server)

const seed = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        console.log('Connected to MySQL...');

        // Create Database if not exists (in case schema.sql wasn't run) - though user approved plan, safe to ensure
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.query(`USE ${process.env.DB_NAME}`);

        // Re-run schema to ensure tables exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user1') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id VARCHAR(50) UNIQUE,
                name VARCHAR(100) NOT NULL,
                department VARCHAR(50),
                position VARCHAR(50),
                contact VARCHAR(50),
                password VARCHAR(255),
                manager_id INT, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                date DATE NOT NULL,
                status ENUM('present', 'absent', 'leave') NOT NULL,
                marked_by INT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_attendance (employee_id, date)
            )
        `);

        console.log('Tables checked/created...');

        // Clear existing data to avoid duplicates on re-run
        // await connection.query('DELETE FROM attendance');
        // await connection.query('DELETE FROM employees');
        // await connection.query('DELETE FROM users');
        // Commented out to prevent accidental data loss if re-run on production. 
        // For development, we'll check if exists.

        // Check if admin exists
        const [users] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);

        let adminId;
        let user1Id;

        if (users.length === 0) {
            const adminHash = await bcrypt.hash('admin123', 10);
            const [adminRes] = await connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', adminHash, 'admin']);
            adminId = adminRes.insertId;
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
            adminId = users[0].id;
        }

        const [users1] = await connection.query('SELECT * FROM users WHERE username = ?', ['user1']);
        if (users1.length === 0) {
            const user1Hash = await bcrypt.hash('user123', 10);
            const [user1Res] = await connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['user1', user1Hash, 'user1']);
            user1Id = user1Res.insertId;
            console.log('User1 created');
        } else {
            console.log('User1 already exists');
            user1Id = users1[0].id;
        }

        // Seed Employees assigned to user1 (technically just employees, but we'll assign their manager_id to user1Id)
        const [empCount] = await connection.query('SELECT COUNT(*) as count FROM employees');
        if (empCount[0].count < 10) {
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

            for (const emp of employees) {
                await connection.query(
                    'INSERT INTO employees (name, department, position, contact, manager_id) VALUES (?, ?, ?, ?, ?)',
                    [...emp, user1Id]
                );
            }
            console.log('Employees seeded');
        } else {
            console.log('Employees already seeded');
        }

        connection.end();
        console.log('Seeding complete.');
        process.exit(0);

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seed();
