# StudyHub Deployment Guide

Congratulations on finishing the full-stack StudyHub application! You now have a complete, production-ready codebase. 

Because we built this using best practices (React frontend compiled statically, Express backend serving the files, PostgreSQL for the database), deploying this to the internet is incredibly straightforward.

Follow these steps to deploy your application so anyone can use it:

## 1. Deploy the PostgreSQL Database
Since you are currently using a local database via pgAdmin, you will need a hosted database to deploy the app online.
- Go to a free PostgreSQL host like **Render**, **Supabase**, or **Neon**.
- Create a new Postgres database.
- They will give you a **Connection URL** (it looks like `postgresql://user:password@hostname:5432/dbname`).
- Using SQLTools (or pgAdmin) connected to that new online database, run your SQL scripts to create the `users`, `courses`, `assignments`, and `exams` tables just like you did locally.

## 2. Deploy the Express Server (Backend + Frontend)
Since we configured the Express backend to serve the React frontend, you only need to deploy **one** server.

- Push your entire `StudyHub` folder (both `backend` and `frontend`) to a GitHub repository.
- Go to a platform like **Render.com** or **Heroku** and create a new **Web Service**.
- Connect it to your GitHub repository.
- Set the following settings:
  - **Root Directory**: `backend`
  - **Build Command**: `cd ../frontend && npm install && npm run build && cd ../backend && npm install`
  - **Start Command**: `node server.js`

## 3. Configure Environment Variables
In your hosting platform's dashboard (e.g., Render or Heroku), find the **Environment Variables** section and add the following keys:

- `DB_USER`: (from your online database)
- `DB_PASSWORD`: (from your online database)
- `DB_HOST`: (from your online database)
- `DB_PORT`: `5432`
- `DB_NAME`: (from your online database)
- `JWT_SECRET`: (Generate a long, random string of text and paste it here)

## 4. Launch!
Save your settings and let the hosting platform build and start your app. 
Once it's done, they will provide you with a live URL (e.g., `https://studyhub-app.onrender.com`). You can visit that URL to see your live dashboard!
