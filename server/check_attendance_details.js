const pool = require('./config/db');

async function checkAttendance() {
    try {
        const [attendance] = await pool.query('SELECT * FROM attendance');
        console.log('Attendance Records:', JSON.stringify(attendance, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAttendance();
