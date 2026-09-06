const db = require('../config/db');


// ======================================================
// MARK ATTENDANCE
// POST /api/attendance
// User1 only
// ======================================================

const markAttendance = async (req, res) => {

    const { employeeId, date, status } = req.body;

    // Check required fields
    if (!employeeId || !date || !status) {
        return res.status(400).json({
            message: 'Employee, date and status are required'
        });
    }

    // Validate status
    const validStatuses = [
        'present',
        'absent',
        'leave'
    ];

    if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
            message: 'Invalid attendance status'
        });
    }

    // Only User1 can mark attendance
    if (req.user.role !== 'user1') {
        return res.status(403).json({
            message: 'Only User1 can mark attendance'
        });
    }

    try {

        // ------------------------------------------
        // Check employee belongs to this User1
        // ------------------------------------------

        const [employees] = await db.query(
            `
            SELECT
                id,
                name,
                department,
                position
            FROM employees
            WHERE id = ?
            AND manager_id = ?
            `,
            [
                employeeId,
                req.user.id
            ]
        );

        if (employees.length === 0) {

            return res.status(404).json({
                message:
                    'Employee not found or not assigned to you'
            });

        }


        // ------------------------------------------
        // Insert / Update attendance
        // ------------------------------------------

        await db.query(
            `
            INSERT INTO attendance
                (
                    employee_id,
                    date,
                    status,
                    marked_by
                )
            VALUES
                (?, ?, ?, ?)

            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                marked_by = VALUES(marked_by),
                timestamp = CURRENT_TIMESTAMP
            `,
            [
                employeeId,
                date,
                status.toLowerCase(),
                req.user.id
            ]
        );


        // ------------------------------------------
        // Return updated summary
        // ------------------------------------------

        const [summary] = await db.query(
            `
            SELECT

                SUM(
                    CASE
                        WHEN status = 'present'
                        THEN 1
                        ELSE 0
                    END
                ) AS presentCount,

                SUM(
                    CASE
                        WHEN status = 'absent'
                        THEN 1
                        ELSE 0
                    END
                ) AS absentCount,

                SUM(
                    CASE
                        WHEN status = 'leave'
                        THEN 1
                        ELSE 0
                    END
                ) AS leaveCount

            FROM attendance

            WHERE employee_id = ?
            `,
            [employeeId]
        );


        const present =
            Number(summary[0].presentCount || 0);

        const absent =
            Number(summary[0].absentCount || 0);

        const leave =
            Number(summary[0].leaveCount || 0);


        // Leave is not counted as a conducted lecture
        const conducted =
            present + absent;


        const percentage =
            conducted > 0
                ? (present / conducted) * 100
                : 0;


        // Next lecture calculations

        const nextLectureAttend =
            conducted >= 0
                ? ((present + 1) / (conducted + 1)) * 100
                : 100;


        const nextLectureMiss =
            conducted >= 0
                ? (present / (conducted + 1)) * 100
                : 0;


        return res.status(201).json({

            message:
                'Attendance marked successfully',

            attendance: {
                employeeId: Number(employeeId),
                date,
                status: status.toLowerCase(),
                markedBy: req.user.id
            },

            summary: {

                present,

                absent,

                leave,

                conducted,

                percentage:
                    Number(
                        percentage.toFixed(2)
                    ),

                nextLectureAttend:
                    Number(
                        nextLectureAttend.toFixed(2)
                    ),

                nextLectureMiss:
                    Number(
                        nextLectureMiss.toFixed(2)
                    )

            }

        });

    } catch (error) {

        console.error(
            'Mark attendance error:',
            error.message
        );

        return res.status(500).json({
            message: error.message
        });

    }
};



// ======================================================
// GET ATTENDANCE RECORDS
// GET /api/attendance
// ======================================================

const getAttendance = async (req, res) => {

    try {

        let query = `
            SELECT
                a.id,
                a.employee_id,
                a.date,
                a.status,
                a.marked_by,
                a.timestamp,

                e.name AS employee_name,
                e.department,
                e.position

            FROM attendance a

            JOIN employees e
                ON a.employee_id = e.id
        `;

        let params = [];


        // ------------------------------------------
        // User1
        // Can see assigned employees
        // ------------------------------------------

        if (req.user.role === 'user1') {

            query += `
                WHERE e.manager_id = ?
            `;

            params.push(req.user.id);

        }


        // ------------------------------------------
        // Employee/User
        // Can see only own attendance
        // ------------------------------------------

        else {

            query += `
                WHERE a.employee_id = ?
            `;

            params.push(req.user.id);

        }


        // ------------------------------------------
        // Latest attendance first
        // ------------------------------------------

        query += `
            ORDER BY
                a.date DESC,
                a.timestamp DESC
        `;


        const [records] =
            await db.query(
                query,
                params
            );


        return res.json(records);

    } catch (error) {

        console.error(
            'Get attendance error:',
            error.message
        );

        return res.status(500).json({
            message: error.message
        });

    }
};



// ======================================================
// GET ATTENDANCE SUMMARY
// GET /api/attendance/summary/:employeeId
// ======================================================

const getAttendanceSummary = async (req, res) => {

    const { employeeId } = req.params;

    try {

        // ------------------------------------------
        // Check employee access
        // ------------------------------------------

        if (req.user.role === 'user1') {

            const [employee] =
                await db.query(
                    `
                    SELECT id
                    FROM employees
                    WHERE id = ?
                    AND manager_id = ?
                    `,
                    [
                        employeeId,
                        req.user.id
                    ]
                );


            if (employee.length === 0) {

                return res.status(403).json({
                    message:
                        'You are not authorized to view this employee'
                });

            }

        } else {

            // Employee can only see own summary

            if (
                Number(employeeId) !==
                Number(req.user.id)
            ) {

                return res.status(403).json({
                    message:
                        'You are not authorized to view this attendance'
                });

            }

        }


        // ------------------------------------------
        // Get attendance counts
        // ------------------------------------------

        const [records] =
            await db.query(
                `
                SELECT

                    SUM(
                        CASE
                            WHEN status = 'present'
                            THEN 1
                            ELSE 0
                        END
                    ) AS presentCount,

                    SUM(
                        CASE
                            WHEN status = 'absent'
                            THEN 1
                            ELSE 0
                        END
                    ) AS absentCount,

                    SUM(
                        CASE
                            WHEN status = 'leave'
                            THEN 1
                            ELSE 0
                        END
                    ) AS leaveCount

                FROM attendance

                WHERE employee_id = ?
                `,
                [employeeId]
            );


        const present =
            Number(
                records[0].presentCount || 0
            );


        const absent =
            Number(
                records[0].absentCount || 0
            );


        const leave =
            Number(
                records[0].leaveCount || 0
            );


        // ------------------------------------------
        // Calculate conducted lectures
        // ------------------------------------------

        const conducted =
            present + absent;


        // ------------------------------------------
        // Current attendance percentage
        // ------------------------------------------

        const percentage =
            conducted > 0
                ? (present / conducted) * 100
                : 0;


        // ------------------------------------------
        // If next lecture is attended
        // ------------------------------------------

        const nextLectureAttend =
            ((present + 1) /
                (conducted + 1)) * 100;


        // ------------------------------------------
        // If next lecture is missed
        // ------------------------------------------

        const nextLectureMiss =
            (present /
                (conducted + 1)) * 100;


        // ------------------------------------------
        // Send result
        // ------------------------------------------

        return res.json({

            employeeId:
                Number(employeeId),

            present,

            absent,

            leave,

            conducted,

            percentage:
                Number(
                    percentage.toFixed(2)
                ),

            nextLectureAttend:
                Number(
                    nextLectureAttend.toFixed(2)
                ),

            nextLectureMiss:
                Number(
                    nextLectureMiss.toFixed(2)
                )

        });

    } catch (error) {

        console.error(
            'Attendance summary error:',
            error.message
        );

        return res.status(500).json({
            message: error.message
        });

    }
};



// ======================================================
// EXPORT
// ======================================================

module.exports = {

    markAttendance,

    getAttendance,

    getAttendanceSummary

};