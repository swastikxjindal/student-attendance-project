const mysql = require('mysql2/promise');

async function testConnection() {
    const configs = [
        { host: 'localhost', port: 3306 },
        { host: '127.0.0.1', port: 3306 },
        { host: 'localhost', port: 3307 },
        { host: '127.0.0.1', port: 3307 }
    ];

    for (const config of configs) {
        try {
            const connection = await mysql.createConnection({
                host: config.host,
                port: config.port,
                user: 'root',
                password: ''
            });
            console.log(`STREAMS_OK: ${config.host}:${config.port}`);
            await connection.end();
        } catch (error) {
            console.log(`STREAMS_FAIL: ${config.host}:${config.port} - ${error.code}`);
        }
    }
    process.exit(0);
}

testConnection();
