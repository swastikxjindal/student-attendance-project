const express = require('express');
const axios = require('axios');

const db = require('../config/db');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


router.get(
    '/predict/:employeeId',
    protect,
    async (req, res) => {

        const { employeeId } = req.params;

        try {

            // --------------------------------
            // Get employee
            // --------------------------------

            const [employees] = await db.query(
                `
                SELECT *
                FROM employees
                WHERE id = ?
                `,
                [employeeId]
            );


            if (employees.length === 0) {

                return res.status(404).json({
                    message: 'Employee not found'
                });

            }


            // --------------------------------
            // Get REAL attendance records
            // --------------------------------

            const [records] = await db.query(
                `
                SELECT
                    employee_id,
                    date,
                    status
                FROM attendance
                WHERE employee_id = ?
                ORDER BY date ASC
                `,
                [employeeId]
            );

            console.log("=================================");
console.log("HISTORICAL ATTENDANCE DATA");
console.log("Employee ID:", employeeId);
console.log("Records from MySQL:", records);
console.log("Number of records:", records.length);
console.log("=================================");


            // --------------------------------
            // Send records to Python ML
            // --------------------------------

            const mlResponse = await axios.post(
                'http://localhost:5002/predict',
                {
                    records
                }
            );

console.log("=================================");
console.log("RESPONSE FROM ML");
console.log(mlResponse.data);
console.log("=================================");
            return res.json({
                employee: employees[0],
                attendance_records: records,
                prediction: mlResponse.data
            });


        } catch (error) {

            console.error(
                'ML route error:',
                error.message
            );


            return res.status(500).json({
                message:
                    error.response?.data?.message ||
                    error.message
            });

        }

    }
);


module.exports = router;