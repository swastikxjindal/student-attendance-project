const mysql = require('mysql2/promise');

async function checkAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: '',
            database: 'attendance_system'
        });
        const [users] = await connection.query('SELECT username, role FROM users');
        console.log('Users:', users);
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAdmin();
