const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env from one level up
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkUser = async () => {
    try {
        console.log('Connecting to DB...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('Connected.');

        console.log('Querying users...');
        const [users] = await connection.query('SELECT * FROM users');
        console.log('Users found:', users.length);
        console.table(users.map(u => ({ id: u.id, username: u.username, role: u.role, password_hash: u.password.substring(0, 10) + '...' })));

        const targetUser = 'user1';
        const targetPass = 'user123';
        const user = users.find(u => u.username === targetUser);

        if (user) {
            console.log(`Checking password for ${targetUser}...`);
            const isMatch = await bcrypt.compare(targetPass, user.password);
            console.log(`Password '${targetPass}' matches: ${isMatch}`);
        } else {
            console.log(`User ${targetUser} not found!`);
        }

        const adminUser = users.find(u => u.username === 'admin');
        if (adminUser) {
            console.log(`Checking password for admin...`);
            const isMatch = await bcrypt.compare('admin123', adminUser.password);
            console.log(`Password 'admin123' matches: ${isMatch}`);
        }

        await connection.end();

    } catch (error) {
        console.error('Error:', error);
    }
};

checkUser();
