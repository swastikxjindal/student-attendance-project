const mysql = require('mysql2/promise');

async function checkDB() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: ''
        });
        const [databases] = await connection.query('SHOW DATABASES');
        console.log('Databases:', databases.map(db => db.Database));
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDB();
