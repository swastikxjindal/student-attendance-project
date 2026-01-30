async function testemployeeLogin() {
    const employeeName = 'employeeTest_' + Date.now();
    const employeePassword = 'password123';

    try {
        // 1. Admin logs in
        const adminLogin = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const adminData = await adminLogin.json();
        const token = adminData.token;
        console.log('Admin logged in');

        // 2. Admin registers employee
        const regRes = await fetch('http://localhost:5001/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: employeeName,
                department: 'IT',
                position: 'Developer',
                password: employeePassword
            })
        });
        const regData = await regRes.json();
        console.log('employee Registration:', regRes.status);

        if (regRes.status === 201) {
            // 3. New employee tries to log in
            const employeeLogin = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: employeeName, password: employeePassword })
            });
            const employeeData = await employeeLogin.json();
            console.log('employee Login Status:', employeeLogin.status);
            console.log('employee Login Data:', employeeData);

            if (employeeLogin.status === 200) {
                console.log('--- TEST PASSED: employee can log in ---');
            } else {
                console.log('--- TEST FAILED: employee cannot log in ---');
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testemployeeLogin();
