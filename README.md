# 📚 StudyHub

**Live Demo:** [https://studyhub1-q89b.onrender.com](https://studyhub1-q89b.onrender.com)

StudyHub is a comprehensive, full-stack study tracking and gamification application. Built from scratch, it allows students to seamlessly organize their coursework, assignments, and exams while staying motivated through a point-based ranking system.

## ✨ Key Features

* **Secure Authentication:** Complete registration and login system using JWT (JSON Web Tokens) and bcrypt password hashing.
* **Dynamic Dashboard:** Real-time overview of daily study time, pending assignments, and upcoming exams.
* **Gamification Engine:** Users earn "Study Points" to rank up (from *Unranked* to *Diamond*) based on completed study sessions.
* **Task Management:** Full CRUD (Create, Read, Update, Delete) operations for courses and assignments.
* **Responsive Design:** Fully responsive UI with a custom mobile sidebar and hamburger menu.
* **Progressive Web App (PWA):** Built-in support for offline caching via Service Workers.

## 🛠️ Tech Stack

### Frontend
* **React:** UI library
* **Vite:** Build tool and bundler
* **React Router:** Client-side routing
* **Vite PWA:** Progressive Web App support
* **CSS:** Custom responsive styling with CSS variables

### Backend
* **Node.js & Express:** RESTful API server
* **PostgreSQL:** Relational database for persistent storage
* **`pg` (Node-Postgres):** Database client
* **JWT & bcrypt:** Authentication and security

## 🚀 Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hossamzebian-create/StudyHub.git
   cd StudyHub
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Make sure PostgreSQL is running locally on port 5432
   node server.js
   ```

3. **Frontend Setup:**
   ```bash
   # Open a new terminal
   cd frontend
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## ☁️ Deployment
* The backend is deployed and hosted on **Render**.
* The frontend is deployed as a Static Site on **Render** (and mirrored on **Surge**).
