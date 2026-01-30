const db = require('./config/db');

async function checkSchema() {
    try {
        const [emp] = await db.query('DESCRIBE employees');
        console.log('--- EMPLOYEES ---');
        emp.forEach(f => console.log(`${f.Field}: ${f.Type} | Null: ${f.Null} | Key: ${f.Key} | Default: ${f.Default}`));

        const [users] = await db.query('DESCRIBE users');
        console.log('\n--- USERS ---');
        users.forEach(f => console.log(`${f.Field}: ${f.Type} | Null: ${f.Null} | Key: ${f.Key} | Default: ${f.Default}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
