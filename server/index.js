const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// DB Connection Check
const db = require('./config/db');
db.getConnection()
    .then(connection => {
        console.log('Connected to MySQL Database');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);

app.get('/', (req, res) => {
    res.send('Attendance System API is running');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
