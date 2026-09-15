require("dotenv").config();
const pool = require("./db");

async function initDB() {
    console.log("Initializing database tables...");
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                study_points INTEGER DEFAULT 0
            );
        `);
        console.log("Users table ready.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(100),
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("Courses table ready.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS assignments (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                due_date DATE,
                priority VARCHAR(50),
                status VARCHAR(50),
                course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("Assignments table ready.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS exams (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                exam_date DATE,
                course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("Exams table ready.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS study_sessions (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                session_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                status VARCHAR(50) DEFAULT 'Planned'
            );
        `);
        console.log("Study Sessions table ready.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS course_schedules (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                day_of_week VARCHAR(20) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL
            );
        `);
        console.log("Course Schedules table ready.");

        console.log("Database initialization complete!");
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
}

module.exports = initDB;
