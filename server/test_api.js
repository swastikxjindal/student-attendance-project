async function testRegister() {
    try {
        // First log in to get token
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Logged in, token received');

        // Then try to register
        const regRes = await fetch('http://localhost:5001/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Test Candidate ' + Date.now(),
                employee_id: 'TEST-' + Date.now(),
                department: 'IT',
                position: 'Tester',
                contact: 'test@test.com',
                password: 'password123'
            })
        });
        const regData = await regRes.json();
        console.log('Registration Status:', regRes.status);
        console.log('Registration Data:', regData);

        if (regRes.status === 201) {
            // Then try to delete
            const id = regData.employee.id;
            const delRes = await fetch(`http://localhost:5001/api/employees/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const delData = await delRes.json();
            console.log('Deletion Status:', delRes.status);
            console.log('Deletion Data:', delData);
        }

    } catch (err) {
        console.error('Error occurred:', err.message);
    }
}

testRegister();
