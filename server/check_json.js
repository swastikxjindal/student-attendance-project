const pool = require('./config/db');

async function checkJson() {
    try {
        const [records] = await pool.query(`
            SELECT a.*, e.name as employee_name, e.department, e.position 
            FROM attendance a 
            JOIN employees e ON a.employee_id = e.id
        `);
        console.log('JSON Output Sample:');
        console.log(JSON.stringify(records[0], null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkJson();
