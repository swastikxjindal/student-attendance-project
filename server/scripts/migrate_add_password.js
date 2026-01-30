const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to MySQL...');

        // Check if password column exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'employees' 
            AND COLUMN_NAME = 'password'
        `, [process.env.DB_NAME]);

        if (columns.length === 0) {
            // Add password column
            await connection.query(`
                ALTER TABLE employees 
                ADD COLUMN password VARCHAR(255) AFTER contact
            `);
            console.log('✅ Password column added to employees table');
        } else {
            console.log('ℹ️  Password column already exists');
        }

        connection.end();
        console.log('Migration complete.');
        process.exit(0);

    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrate();
