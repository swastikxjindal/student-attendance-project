async function debugRequest() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        const res = await fetch('http://localhost:5000/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'John Test ' + Date.now(),
                department: 'IT',
                position: 'Tester',
                password: 'password123'
            })
        });

        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Body:', text);
    } catch (err) {
        console.log('Error:', err.message);
    }
}

debugRequest();
