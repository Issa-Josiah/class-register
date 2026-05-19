import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, Users, UserCheck, Calendar, LogOut, Sun, Moon } from 'lucide-react';
import ClassRepPortal from './pages/ClassRepPortal';
import TeacherPortal from './pages/TeacherPortal';
import HomeLogin from './pages/HomeLogin'; 
import './AttendanceRegister.css';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzWSIHlfud1g8btqB46KNSGuhHETV3GkGl2EdueTJ0J8vp7KU8Dhl4TjlDp7ImQAcvaFA/exec";

export default function AttendanceRegister() {
  const [students, setStudents] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const [theme, setTheme] = useState('dark');

  const todayDate = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch initial profile values and dynamic worksheet locks from database
  const refreshDatabaseState = async () => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();
      setStudents(data.students || []);
      setIsLocked(data.isLocked || false); 
    } catch (err) {
      console.error("Failed loading data from Google Sheets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDatabaseState();
  }, []);

  // Shared modular utility function to dispatch clean payload streams across HTTP lines
  const apiPostRequest = async (actionBody) => {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(actionBody)
      });
      const data = await res.json();
      if (data && data.status === "success") {
        if (data.isLocked !== undefined) {
          setIsLocked(data.isLocked);
        }
      }
      return data;
    } catch (error) {
      console.error("Cloud tracking synchronization write failure:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/', { replace: true });
  };

  const handleAddStudent = async (name, admissionNumber) => {
    if (isLocked) return;
    
    const nextId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const nextRollNo = String(nextId).padStart(3, '0'); 
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
    await apiPostRequest({
      action: "ADD_STUDENT",
      student: { rollNo: nextRollNo, name: name, admissionNumber: finalAdmNo }
    });
  };

  const handleSubmitLogs = async () => {
    // Optimistically lock Class Rep view layout instantly
    setIsLocked(true);
    const result = await apiPostRequest({
      action: "SUBMIT_ATTENDANCE",
      date: todayDate,
      students: students
    });
    
    if (result && result.status === "success") {
      alert(`Daily attendance compiled and locked for review! Sent to Teacher Section.`);
    } else {
      setIsLocked(false);
      alert("Error submitting logs. Please check your connection.");
    }
  };

  const handleVerifyStudent = async (id) => {
    let targetStudent = null;

    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        targetStudent = { ...s, verified: !s.verified };
        return targetStudent;
      }
      return s;
    }));

    if (!targetStudent) return;

    // Custom Rule: Interaction unlocks the registry system layout immediately
    setIsLocked(false);

    await apiPostRequest({
      action: "UPDATE_VERIFICATION",
      date: todayDate,
      rollNo: targetStudent.rollNo,
      verified: targetStudent.verified
    });
  };

  const handleApproveAllStudents = async () => {
    setStudents(prev => prev.map(s => ({ ...s, verified: true })));
    setIsLocked(false); // Automatically updates state to unlocked when teacher verifies everything

    await apiPostRequest({
      action: "APPROVE_ALL",
      date: todayDate
    });
    alert("All active row records verified successfully. Ledger form reopened for Class Rep updates.");
  };

  const handleUnlockLogs = async () => {
    setIsLocked(false);
    await apiPostRequest({
      action: "UNLOCK_ATTENDANCE",
      date: todayDate
    });
    alert("Attendance register has been manually unlocked. The Class Representative workspace is now active.");
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
        <Route path="/" element={<HomeLogin onLoginSuccess={handleLoginSuccess} currentTheme={theme} />} />
        
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
        
        <Route 
          path="/teacher" 
          element={
            isAuthenticated && userRole === 'teacher' ? (
              <TeacherPortal 
                students={students}
                isLocked={isLocked} 
                alwaysEditable={true} 
                onVerify={handleVerifyStudent}
                onApproveAll={handleApproveAllStudents}
                onUnlock={handleUnlockLogs}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}