import { useState } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('studyhub_token');
    window.location.href = '/login';
  };

  const closeMenu = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      <ScheduleNotifier />
      
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <h2>StudyHub</h2>
        <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}

      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>StudyHub</h2>
          <button className="close-sidebar-btn" onClick={closeMenu}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
             </svg>
          </button>
        </div>
        <div className="nav-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>
            Dashboard
          </Link>
          <Link to="/courses" className={`nav-item ${location.pathname === '/courses' ? 'active' : ''}`} onClick={closeMenu}>
            Courses
          </Link>
          <Link to="/assignments" className={`nav-item ${location.pathname === '/assignments' ? 'active' : ''}`} onClick={closeMenu}>
            Assignments
          </Link>
          <Link to="/exams" className={`nav-item ${location.pathname === '/exams' ? 'active' : ''}`} onClick={closeMenu}>
            Exams
          </Link>
          <Link to="/study-plan" className={`nav-item ${location.pathname === '/study-plan' ? 'active' : ''}`} onClick={closeMenu}>
            Study Plan
          </Link>
          <Link to="/weekly-schedule" className={`nav-item ${location.pathname === '/weekly-schedule' ? 'active' : ''}`} onClick={closeMenu}>
            Weekly Schedule
          </Link>
          <Link to="/calendar" className={`nav-item ${location.pathname === '/calendar' ? 'active' : ''}`} onClick={closeMenu}>
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
