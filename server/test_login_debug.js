const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function testLogin() {
    const username = 'admin';
    const password = 'admin123';

    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            console.log('User not found');
        } else {
            const match = await bcrypt.compare(password, users[0].password);
            console.log(`Login test for ${username}: ${match ? 'SUCCESS' : 'FAILED'}`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testLogin();
