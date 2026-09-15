require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./authMiddleware");

const initDB = require("./init_db");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database tables
initDB();

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
    console.error(error);

    if (error.code === "23505") {
        return res.status(400).json({
            error: "Email already exists"
        });
    }


    res.status(500).json({
        error: "Registration failed"
    });
}
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET || "studyhub-secret-key",
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Login failed"
        });
    }
});

const PORT = process.env.PORT || 5000;



app.get("/api/courses", (req, res) => {
    res.json([
        {
            id: 1,
            name: "Data Structures",
            code: "CPE 203"
        },
        {
            id: 2,
            name: "C++",
            code: "CPE 204"
        }
    ]);
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

app.get("/api/db-courses", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
    "SELECT * FROM courses WHERE user_id = $1",
    [req.user.id]
);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database query failed" });
    }
});

app.get("/api/courses/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM courses WHERE id = $1 AND user_id = $2",
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database query failed"
        });
    }
});
app.put("/api/courses/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code } = req.body;

        const result = await pool.query(
            "UPDATE courses SET name = $1, code = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
            [name, code, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database update failed"
        });
    }
});

app.delete("/api/courses/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM courses WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        res.json({
            message: "Course deleted successfully",
            course: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database deletion failed"
        });
    }
});

app.post("/api/assignments", authenticateToken, async (req, res) => {
    try {
        const {
            title,
            description,
            due_date,
            priority,
            status,
            course_id
        } = req.body;

        const courseCheck = await pool.query("SELECT * FROM courses WHERE id = $1 AND user_id = $2", [course_id, req.user.id]);
        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: "Invalid course or permission denied" });
        }

        const result = await pool.query(
            `INSERT INTO assignments
            (title, description, due_date, priority, status, course_id, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                title,
                description,
                due_date,
                priority,
                status,
                course_id,
                req.user.id
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Assignment creation failed"
        });
    }
});

app.get("/api/assignments", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM assignments WHERE user_id = $1 ORDER BY due_date ASC",
            [req.user.id]
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database query failed"
        });
    }
});
app.get("/api/assignments/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM assignments WHERE id = $1 AND user_id = $2",
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Assignment not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database query failed"
        });
    }
});
app.put("/api/assignments/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            due_date,
            priority,
            status,
            course_id
        } = req.body;

        const result = await pool.query(
            `UPDATE assignments
             SET title = $1,
                 description = $2,
                 due_date = $3,
                 priority = $4,
                 status = $5,
                 course_id = $6
             WHERE id = $7 AND user_id = $8
             RETURNING *`,
            [
                title,
                description,
                due_date,
                priority,
                status,
                course_id,
                id,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Assignment not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Assignment update failed"
        });
    }
});

app.delete("/api/assignments/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM assignments WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Assignment not found"
            });
        }

        res.json({
            message: "Assignment deleted successfully",
            assignment: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Assignment deletion failed"
        });
    }
});

app.post("/api/courses", authenticateToken, async (req, res) => {
    try {
        const { name, code } = req.body;
        const result = await pool.query(
            "INSERT INTO courses (name, code, user_id) VALUES ($1, $2, $3) RETURNING *",
            [name, code, req.user.id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create course" });
    }
});

// ==========================================
// EXAMS ENDPOINTS
// ==========================================

app.post("/api/exams", authenticateToken, async (req, res) => {
    try {
        const { title, description, exam_date, course_id } = req.body;

        if (!title || !exam_date || !course_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const courseCheck = await pool.query("SELECT * FROM courses WHERE id = $1 AND user_id = $2", [course_id, req.user.id]);
        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: "Invalid course or permission denied" });
        }

        const result = await pool.query(
            "INSERT INTO exams (title, description, exam_date, course_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [title, description, exam_date, course_id, req.user.id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Exam creation failed" });
    }
});

app.get("/api/exams", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM exams WHERE user_id = $1 ORDER BY exam_date ASC",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database query failed" });
    }
});

app.get("/api/exams/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT * FROM exams WHERE id = $1 AND user_id = $2",
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Exam not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database query failed" });
    }
});

app.put("/api/exams/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, exam_date, course_id } = req.body;

        const result = await pool.query(
            `UPDATE exams SET title = $1, description = $2, exam_date = $3, course_id = $4
             WHERE id = $5 AND user_id = $6 RETURNING *`,
            [title, description, exam_date, course_id, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Exam not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Exam update failed" });
    }
});

app.delete("/api/exams/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM exams WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Exam not found" });
        }

        res.json({ message: "Exam deleted successfully", exam: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Exam deletion failed" });
    }
});

// ==========================================
// STUDY SESSIONS ENDPOINTS
// ==========================================

const getRankDetails = (points) => {
    if (points < 30) return { rank: 'Unranked', icon: '🥚', min: 0, max: 30, next: 'Bronze' };
    if (points < 90) return { rank: 'Bronze', icon: '🟤', min: 30, max: 90, next: 'Silver' };
    if (points < 180) return { rank: 'Silver', icon: '⚪', min: 90, max: 180, next: 'Gold' };
    if (points < 270) return { rank: 'Gold', icon: '🟡', min: 180, max: 270, next: 'Platinum' };
    if (points < 360) return { rank: 'Platinum', icon: '🔵', min: 270, max: 360, next: 'Diamond' };
    return { rank: 'Diamond', icon: '💎', min: 360, max: null, next: null };
};

const getTodayPoints = async (userId) => {
    // Current date string in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const res = await pool.query(
        "SELECT start_time, end_time FROM study_sessions WHERE user_id = $1 AND status = 'Completed' AND CAST(session_date AS TEXT) LIKE $2",
        [userId, `${today}%`]
    );
    let totalMins = 0;
    res.rows.forEach(session => {
        const [startH, startM] = session.start_time.split(':').map(Number);
        const [endH, endM] = session.end_time.split(':').map(Number);
        totalMins += (endH * 60 + endM) - (startH * 60 + startM);
    });
    return totalMins > 0 ? totalMins : 0;
};

app.post("/api/study-sessions", authenticateToken, async (req, res) => {
    try {
        const { title, course_id, session_date, start_time, end_time } = req.body;
        
        // Check for overlap
        const overlapCheck = await pool.query(
            `SELECT * FROM study_sessions 
             WHERE user_id = $1 AND session_date = $2 
             AND start_time < $4 AND end_time > $3`,
            [req.user.id, session_date, start_time, end_time]
        );

        if (overlapCheck.rows.length > 0) {
            return res.status(400).json({ error: "Time slot overlaps with an existing study block." });
        }

        const result = await pool.query(
            "INSERT INTO study_sessions (user_id, title, course_id, session_date, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [req.user.id, title, course_id || null, session_date, start_time, end_time]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create study session" });
    }
});

app.get("/api/study-sessions", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM study_sessions WHERE user_id = $1 ORDER BY session_date ASC, start_time ASC",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch study sessions" });
    }
});

app.delete("/api/study-sessions/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM study_sessions WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Study session not found" });
        }
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete study session" });
    }
});

app.put("/api/study-sessions/:id/end-early", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { new_end_time } = req.body;
        
        const sessionRes = await pool.query("SELECT * FROM study_sessions WHERE id = $1 AND user_id = $2", [id, req.user.id]);
        if (sessionRes.rows.length === 0) return res.status(404).json({ error: "Session not found" });
        
        const result = await pool.query(
            "UPDATE study_sessions SET end_time = $1 WHERE id = $2 RETURNING *",
            [new_end_time, id]
        );
        res.json({ message: "Ended early", session: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to end early" });
    }
});

app.post("/api/study-sessions/:id/complete", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch session
        const sessionRes = await pool.query("SELECT * FROM study_sessions WHERE id = $1 AND user_id = $2", [id, req.user.id]);
        if (sessionRes.rows.length === 0) return res.status(404).json({ error: "Session not found" });
        const session = sessionRes.rows[0];
        
        if (session.status === 'Completed') return res.status(400).json({ error: "Already completed" });

        // Calculate duration in minutes of this newly completed block
        const [startH, startM] = session.start_time.split(':').map(Number);
        const [endH, endM] = session.end_time.split(':').map(Number);
        const durationMins = (endH * 60 + endM) - (startH * 60 + startM);
        const pointsEarned = durationMins > 0 ? durationMins : 0;

        // Get user current points for today BEFORE marking complete
        const oldPoints = await getTodayPoints(req.user.id);
        const oldRank = getRankDetails(oldPoints).rank;

        // Update session
        await pool.query("UPDATE study_sessions SET status = 'Completed' WHERE id = $1", [id]);

        // Get new points for today AFTER marking complete
        const newPoints = await getTodayPoints(req.user.id);
        const newRankDetails = getRankDetails(newPoints);
        
        res.json({
            message: "Session completed",
            pointsEarned,
            newTotal: newPoints,
            rankUp: oldRank !== newRankDetails.rank,
            newRank: newRankDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to complete session" });
    }
});

app.get("/api/user/rank", authenticateToken, async (req, res) => {
    try {
        const points = await getTodayPoints(req.user.id);
        res.json({ points, details: getRankDetails(points) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch rank" });
    }
});

// ==========================================
// WEEKLY COURSE SCHEDULE ENDPOINTS
// ==========================================

app.post("/api/course-schedules", authenticateToken, async (req, res) => {
    try {
        const { course_id, day_of_week, start_time, end_time } = req.body;

        // Check for overlap
        const overlapCheck = await pool.query(
            `SELECT * FROM course_schedules 
             WHERE user_id = $1 AND day_of_week = $2 
             AND start_time < $4 AND end_time > $3`,
            [req.user.id, day_of_week, start_time, end_time]
        );

        if (overlapCheck.rows.length > 0) {
            return res.status(400).json({ error: "Time slot overlaps with an existing course on this day." });
        }

        const result = await pool.query(
            "INSERT INTO course_schedules (user_id, course_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [req.user.id, course_id, day_of_week, start_time, end_time]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create course schedule" });
    }
});

app.get("/api/course-schedules", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT cs.*, c.name as course_name, c.code as course_code FROM course_schedules cs JOIN courses c ON cs.course_id = c.id WHERE cs.user_id = $1",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch course schedules" });
    }
});

app.delete("/api/course-schedules/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM course_schedules WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Course schedule not found" });
        }
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete course schedule" });
    }
});

// ==========================================
// DASHBOARD & CALENDAR ENDPOINTS
// ==========================================

app.get("/api/dashboard", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const coursesResult = await pool.query("SELECT * FROM courses WHERE user_id = $1", [userId]);
        const assignmentsResult = await pool.query("SELECT * FROM assignments WHERE user_id = $1 ORDER BY due_date ASC LIMIT 5", [userId]);
        const examsResult = await pool.query("SELECT * FROM exams WHERE user_id = $1 ORDER BY exam_date ASC LIMIT 5", [userId]);

        const completedAssignments = await pool.query("SELECT COUNT(*) FROM assignments WHERE user_id = $1 AND status = 'Completed'", [userId]);
        const pendingAssignments = await pool.query("SELECT COUNT(*) FROM assignments WHERE user_id = $1 AND status != 'Completed'", [userId]);

        res.json({
            courses: coursesResult.rows,
            upcoming_assignments: assignmentsResult.rows,
            upcoming_exams: examsResult.rows,
            stats: {
                completed_assignments: parseInt(completedAssignments.rows[0].count),
                pending_assignments: parseInt(pendingAssignments.rows[0].count),
                total_courses: coursesResult.rows.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Dashboard data retrieval failed" });
    }
});

app.get("/api/calendar", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const assignments = await pool.query("SELECT id, title, description, due_date as date, 'assignment' as type, status, priority FROM assignments WHERE user_id = $1", [userId]);
        const exams = await pool.query("SELECT id, title, description, exam_date as date, 'exam' as type FROM exams WHERE user_id = $1", [userId]);

        const events = [...assignments.rows, ...exams.rows].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Calendar data retrieval failed" });
    }
});

// Serve simple message for root URL
app.get("/", (req, res) => {
    res.send("StudyHub API is running!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});