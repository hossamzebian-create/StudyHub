import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Assignments from './pages/Assignments';
import Exams from './pages/Exams';
import CalendarView from './pages/CalendarView';
import StudyPlan from './pages/StudyPlan';
import WeeklySchedule from './pages/WeeklySchedule';
import ScheduleNotifier from './components/ScheduleNotifier';

function MainLayout({ children }) {
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('studyhub_token');
    window.location.href = '/login';
  };

  return (
    <div className="app-container">
      <ScheduleNotifier />
      <div className="sidebar">
        <h2>StudyHub</h2>
        <div className="nav-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/courses" className={`nav-item ${location.pathname === '/courses' ? 'active' : ''}`}>
            Courses
          </Link>
          <Link to="/assignments" className={`nav-item ${location.pathname === '/assignments' ? 'active' : ''}`}>
            Assignments
          </Link>
          <Link to="/exams" className={`nav-item ${location.pathname === '/exams' ? 'active' : ''}`}>
            Exams
          </Link>
          <Link to="/study-plan" className={`nav-item ${location.pathname === '/study-plan' ? 'active' : ''}`}>
            Study Plan
          </Link>
          <Link to="/weekly-schedule" className={`nav-item ${location.pathname === '/weekly-schedule' ? 'active' : ''}`}>
            Weekly Schedule
          </Link>
          <Link to="/calendar" className={`nav-item ${location.pathname === '/calendar' ? 'active' : ''}`}>
            Calendar
          </Link>
        </div>
        <button onClick={handleLogout} className="btn btn-danger" style={{ marginTop: 'auto' }}>
          Logout
        </button>
      </div>
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('studyhub_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
        <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
        <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
        <Route path="/weekly-schedule" element={<ProtectedRoute><WeeklySchedule /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
