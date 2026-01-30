CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user1') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    position VARCHAR(50),
    contact VARCHAR(50),
    manager_id INT, -- To link with user1 if needed, though requirement says 'assigned employees'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'leave') NOT NULL,
    marked_by INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (marked_by) REFERENCES users(id),
    UNIQUE KEY unique_attendance (employee_id, date)
);

-- Seeding Initial Data
-- Password for admin is 'admin123', for user1 is 'user123' (will need to use bcrypt in app, but for raw sql insert we usually need hashes if the app expects hashes. 
-- For simplicity in this script, we'll insert placeholders or if the app uses bcrypt, we should run a seed script via Node.
-- However, I will insert raw values and assume we might create a seeder utility or manually handle it. 
-- actually, to make it accessible immediately, I will create a Node seeder script instead of raw SQL inserts for passwords.
