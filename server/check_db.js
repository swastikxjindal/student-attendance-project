const pool = require('./config/db');
async function check() {
    try {
        const [rows] = await pool.query('SELECT * FROM employees ORDER BY id DESC LIMIT 5');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
