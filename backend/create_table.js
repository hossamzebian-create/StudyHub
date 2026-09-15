require("dotenv").config({ path: 'c:/Users/faten/OneDrive/Desktop/StudyHub/backend/.env' });
const pool = require('c:/Users/faten/OneDrive/Desktop/StudyHub/backend/db.js');

async function createTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS study_sessions (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                session_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL
            );
        `;
        await pool.query(query);
        console.log("Table 'study_sessions' created successfully!");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        pool.end();
    }
}

createTable();
