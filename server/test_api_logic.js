const pool = require('./config/db');

async function testApiLogic() {
    try {
        // Simulate what getAttendance does
        let query = `
            SELECT a.*, e.name as employee_name, e.department, e.position 
            FROM attendance a 
            JOIN employees e ON a.employee_id = e.id
        `;
        const [records] = await pool.query(query);
        console.log('--- Attendance Records found by SQL ---');
        console.log('Total Records:', records.length);
        if (records.length > 0) {
            console.log('Sample Record:', records[0]);
        }

        // Simulate getLeaves
        let leaveQuery = `
            SELECT l.*, e.name as employee_name 
            FROM leaves l 
            JOIN employees e ON l.employee_id = e.id
        `;
        const [leaves] = await pool.query(leaveQuery);
        console.log('--- Leave Records found by SQL ---');
        console.log('Total Leaves:', leaves.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testApiLogic();
