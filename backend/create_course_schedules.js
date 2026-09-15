require("dotenv").config({ path: 'c:/Users/faten/OneDrive/Desktop/StudyHub/backend/.env' });
const pool = require('c:/Users/faten/OneDrive/Desktop/StudyHub/backend/db.js');

async function createTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS course_schedules (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                day_of_week INTEGER NOT NULL, -- 0 for Sunday, 1 for Monday, etc.
                start_time TIME NOT NULL,
                end_time TIME NOT NULL
            );
        `;
        await pool.query(query);
        console.log("Table 'course_schedules' created successfully!");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        pool.end();
    }
}

createTable();
