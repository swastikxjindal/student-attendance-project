const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const commonPasswords = [
    '',
    'root',
    'admin',
    'password',
    '1234',
    '123456',
    'welcome',
    'welcome123',
    'mysql'
];

const checkPassword = async (password) => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: 'root',
            password: password,
        });
        await connection.end();
        return true;
    } catch (error) {
        return false;
    }
};

const findPassword = async () => {
    console.log('Testing common passwords for root user...');

    for (const password of commonPasswords) {
        process.stdout.write(`Testing password: "${password}" ... `);
        const success = await checkPassword(password);
        if (success) {
            console.log('SUCCESS!');
            console.log(`\nFOUND PASSWORD: "${password}"`);
            console.log('\nPlease update your .env file with this password.');
            return;
        } else {
            console.log('Failed');
        }
    }

    console.log('\nCould not find the password among common defaults.');
    console.log('You may have set a custom password during installation.');
};

findPassword();
