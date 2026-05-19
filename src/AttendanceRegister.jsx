import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, Users, UserCheck, Calendar, LogOut, Sun, Moon } from 'lucide-react';
import ClassRepPortal from './pages/ClassRepPortal';
import TeacherPortal from './pages/TeacherPortal';
import HomeLogin from './pages/HomeLogin'; // Clean Landing Page Gateway
import './AttendanceRegister.css';

// Paste your Google Web App deployment link here
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzWSIHlfud1g8btqB46KNSGuhHETV3GkGl2EdueTJ0J8vp7KU8Dhl4TjlDp7ImQAcvaFA/exec";

export default function AttendanceRegister() {
  const [students, setStudents] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Authentication & Session Guard States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Tracks 'class_rep' or 'teacher'

  // Global Light/Dark Theme State (Defaults to 'dark' for the space aesthetic)
  const [theme, setTheme] = useState('dark');

  const todayDate = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();

  // Watcher to dynamically update the body attribute whenever theme changes
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch the student database from Google Sheets on load
  useEffect(() => {
    async function initializeDatabase() {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        
        setStudents(data.students);
        setIsLocked(data.isLocked); // Automatically lock view if today's log already exists online
      } catch (err) {
        console.error("Failed loading data from Google Roster:", err);
      } finally {
        setLoading(false);
      }
    }
    initializeDatabase();
  }, []);

  // Toggle mode switcher function
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Login Handler called from HomeLogin view
  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  // Terminate active portal session
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/', { replace: true });
  };

  // Action 1: Add a new student to the INDEFINITE roster list
  const handleAddStudent = async (name, admissionNumber) => {
  if (isLocked) return;
  
  const nextId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
  const nextRollNo = String(nextId).padStart(3, '0'); 
  
  // Use user input if provided, otherwise apply default template fallback
  const finalAdmNo = admissionNumber.trim() ? admissionNumber.trim() : `ADM-${nextRollNo}`;

  const newStudentObj = {
    id: nextId,
    rollNo: nextRollNo,
    name: name,
    admissionNumber: finalAdmNo,
    status: "Present",
    verified: false,
    notes: ""
  };

  setStudents(prev => [...prev, newStudentObj]);

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ADD_STUDENT",
        student: { rollNo: nextRollNo, name: name, admissionNumber: finalAdmNo }
      })
    });
  } catch (err) {
    console.error("Could not sync new profile to roster sheet:", err);
  }
};
  // Action 2: Submit today's attendance log sheet values
  const handleSubmitLogs = async () => {
    setIsLocked(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_ATTENDANCE",
          date: todayDate,
          students: students
        })
      });
      alert(`Daily attendance compiled and locked for ${todayDate}!`);
    } catch (error) {
      console.error("Cloud tracking write error:", error);
      setIsLocked(false);
    }
  };

  // Action 3: Handle Teacher Individual Row Verification
  const handleVerifyStudent = async (id) => {
    let targetStudent = null;

    // Local Mutation for performance snappiness
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        targetStudent = { ...s, verified: !s.verified };
        return targetStudent;
      }
      return s;
    }));

    if (!targetStudent) return;

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_VERIFICATION",
          date: todayDate,
          rollNo: targetStudent.rollNo,
          verified: targetStudent.verified
        })
      });
    } catch (err) {
      console.error("Verification sync issue:", err);
    }
  };

  // Action 4: Handle Teacher Bulk Verification Approve All Action
  const handleApproveAllStudents = async () => {
    setStudents(prev => prev.map(s => ({ ...s, verified: true })));

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE_ALL",
          date: todayDate
        })
      });
    } catch (err) {
      console.error("Bulk approval sync issue:", err);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    if (isLocked) return;
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleNoteChange = (id, noteText) => {
    if (isLocked) return;
    setStudents(prev => prev.map(s => s.id === id ? { ...s, notes: noteText } : s));
  };

  if (loading) {
    return <div className="loading-screen">Retrieving master student profiles from Cloud...</div>;
  }

  return (
    <div className="AttendanceRegister-wrapper">
      {/* Structural Header: Hidden on landing view page, active inside panels */}
      {isAuthenticated && (
        <header className="AttendanceRegister-header">
          <div className="AttendanceRegister-brand">
            <div className="AttendanceRegister-logo-bg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="AttendanceRegister-title">Class Manager attendance records</h1>
              <div className="AttendanceRegister-date-badge">
                <Calendar className="h-3.5 w-3.5" />
                <span>Session Date: <strong>{todayDate}</strong></span>
              </div>
            </div>
          </div>

          <nav className="AttendanceRegister-nav-links">
            {userRole === 'class_rep' && (
              <NavLink to="/class-rep" className={({ isActive }) => `AttendanceRegister-nav-item ${isActive ? 'is-active' : 'is-inactive'}`}>
                <Users className="h-4 w-4" /> Class Rep Portal
              </NavLink>
            )}
            {userRole === 'teacher' && (
              <NavLink to="/teacher" className={({ isActive }) => `AttendanceRegister-nav-item ${isActive ? 'is-active' : 'is-inactive'}`}>
                <UserCheck className="h-4 w-4" /> Teacher Portal
              </NavLink>
            )}

            {/* Global Theme Toggle Button */}
            <button onClick={toggleTheme} className="theme-toggle-action-btn" title="Toggle Display Mode">
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>

            <button onClick={handleLogout} className="logout-action-btn">
              <LogOut className="h-4 w-4" /> Exit
            </button>
          </nav>
        </header>
      )}

      <Routes>
        {/* Core Entry Portal Route - Passes theme to control Milky Way layers */}
        <Route path="/" element={<HomeLogin onLoginSuccess={handleLoginSuccess} currentTheme={theme} />} />
        
        {/* Guard Locked Route: Class Rep Portal */}
        <Route 
          path="/class-rep" 
          element={
            isAuthenticated && userRole === 'class_rep' ? (
              <ClassRepPortal 
                students={students}
                isLocked={isLocked}
                onStatusChange={handleStatusChange}
                onNoteChange={handleNoteChange}
                onAddStudent={handleAddStudent}
                onSubmit={handleSubmitLogs}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        {/* Guard Locked Route: Teacher Portal */}
        <Route 
          path="/teacher" 
          element={
            isAuthenticated && userRole === 'teacher' ? (
              <TeacherPortal 
                students={students}
                isLocked={isLocked}
                onVerify={handleVerifyStudent}
                onApproveAll={handleApproveAllStudents}
                onUnlock={() => setIsLocked(false)}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Fallback Catch-all Redirect Strategy */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}