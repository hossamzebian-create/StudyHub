require("dotenv").config({ path: 'c:/Users/faten/OneDrive/Desktop/StudyHub/backend/.env' });
const pool = require('c:/Users/faten/OneDrive/Desktop/StudyHub/backend/db.js');

async function alterTables() {
    try {
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS study_points INTEGER DEFAULT 0;");
        console.log("Added study_points to users.");
        
        await pool.query("ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Planned';");
        console.log("Added status to study_sessions.");
    } catch (err) {
        console.error("Error altering tables:", err);
    } finally {
        pool.end();
    }
}

alterTables();
