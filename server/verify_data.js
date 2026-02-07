const pool = require('./config/db');

async function checkData() {
    try {
        const [employees] = await pool.query('SELECT * FROM employees');
        const [attendance] = await pool.query('SELECT * FROM attendance');
        const [users] = await pool.query('SELECT * FROM users');

        console.log('--- Database Status ---');
        console.log('Users:', users.length);
        console.log('Employees:', employees.length);
        console.log('Attendance:', attendance.length);

        const [tables] = await pool.query('SHOW TABLES');
        console.log('Tables in DB:', tables.map(t => Object.values(t)[0]));

        if (employees.length > 0) {
            console.log('Sample Employee:', employees[0].name);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error checking data:', err);
        process.exit(1);
    }
}

checkData();
