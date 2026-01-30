const db = require('./config/db');

async function checkUsers() {
    try {
        const [users] = await db.query('SELECT id, username, role FROM users');
        console.log('Users in database:', users);
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
}

checkUsers();
