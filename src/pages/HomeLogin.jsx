import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, UserCheck, ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import './HomeLogin.css';

const PASSWORDS = {
  class_rep: "Rep123",
  teacher: "Teach789"
};

export default function HomeLogin({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (passwordInput === PASSWORDS[selectedRole]) {
      onLoginSuccess(selectedRole);
      if (selectedRole === 'class_rep') navigate('/class-rep');
      if (selectedRole === 'teacher') navigate('/teacher');
    } else {
      setErrorMessage('Invalid access security code. Please try again.');
    }
  };

  const backgroundStyle = {
    transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`,
  };

  const ambientGlowStyle = {
    transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)`,
  };

  return (
    <div className="auth-space-wrapper">
      <div className="milkyway-nebula" style={backgroundStyle}></div>
      <div className="milkyway-stars"></div>
      <div className="interactive-ambient-glow" style={ambientGlowStyle}></div>

      <div className="auth-glass-container">
        <div className="auth-card-glass">
          <div className="auth-brand">
            <div className="auth-logo-circle">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h2>Class Manager System</h2>
            <p>Select your authorized node layer to initialize workspace</p>
          </div>

          {!selectedRole ? (
            <div className="role-selection-grid">
              <button className="role-btn-glass rep" onClick={() => setSelectedRole('class_rep')}>
                <div className="role-icon-wrapper">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="role-btn-text">
                  <h3>Class Representative</h3>
                  <span>Log entries and daily sheets</span>
                </div>
              </button>

              <button className="role-btn-glass teacher" onClick={() => setSelectedRole('teacher')}>
                <div className="role-icon-wrapper">
                  <UserCheck className="h-6 w-6 text-purple-400" />
                </div>
                <div className="role-btn-text">
                  <h3>Module Teacher</h3>
                  <span>Review records and verify rows</span>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="password-form">
              <div className="form-header">
                <h4>Accessing {selectedRole === 'class_rep' ? 'Class Rep Portal' : 'Teacher Portal'}</h4>
                <button 
                  type="button" 
                  className="btn-back-glass" 
                  onClick={() => { setSelectedRole(null); setPasswordInput(''); setErrorMessage(''); }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              </div>

              <div className="input-group-glass">
                <label>Enter Security Password Code</label>
                <div className="input-with-icon">
                  <KeyRound className="input-icon" />
                  <input 
                    type="password" 
                    autoFocus
                    placeholder="••••••••" 
                    value={passwordInput} 
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="auth-input-field-glass"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="auth-error-banner-glass">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button type="submit" className="auth-submit-btn-glass">
                Unlock Workspace Dashboard
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}