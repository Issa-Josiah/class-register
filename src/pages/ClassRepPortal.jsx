import React, { useState } from 'react';
import './ClassRepPortal.css';
import { Unlock, Lock, Clock, CheckCircle, UserPlus, ClipboardList } from 'lucide-react';
import DashboardMetrics from '../components/DashboardMetrics';

export default function ClassRepPortal({ students, isLocked, onStatusChange, onNoteChange, onSubmit, onAddStudent }) {
  const [newName, setNewName] = useState('');
  const [newAdmission, setNewAdmission] = useState(''); // Added state control

  const handleAddClick = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    // Pass both values up to the parent container
    onAddStudent(newName.trim(), newAdmission.trim());
    
    // Clear out form inputs smoothly
    setNewName('');
    setNewAdmission('');
  };

  return (
    <div className="ClassRepPortal-main">
      <DashboardMetrics students={students} />

      <div className={`ClassRepPortal-banner ${isLocked ? 'amber' : 'blue'}`}>
        <div className="ClassRepPortal-banner-info">
          {isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
          <span>
            {isLocked 
              ? "Your log is submitted and locked. Waiting for the module teacher to review and verify." 
              : "Draft Mode: Mark student attendance using the action keys and click submit below."}
          </span>
        </div>
        {!isLocked && students.length > 0 && (
          <button onClick={onSubmit} className="ClassRepPortal-btn-primary">
            Submit Attendance
          </button>
        )}
      </div>

      {!isLocked && (
        <form onSubmit={handleAddClick} className="ClassRepPortal-add-card" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text"
            value={newName}
            placeholder="Student Full Name..."
            onChange={(e) => setNewName(e.target.value)}
            className="ClassRepPortal-input-text"
            required
          />
          <input 
            type="text"
            value={newAdmission}
            placeholder="Admission No (Optional)..."
            onChange={(e) => setNewAdmission(e.target.value)}
            className="ClassRepPortal-input-text"
          />
          <button type="submit" className="ClassRepPortal-btn-secondary flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Add Student
          </button>
        </form>
      )}

      {students.length === 0 ? (
        <div className="ClassRepPortal-empty-state">
          <ClipboardList className="ClassRepPortal-empty-icon" />
          <h3>No Students Registered Yet</h3>
          <p>The attendance ledger is currently empty. Use the fields above to start building the roster.</p>
        </div>
      ) : (
        <div className="ClassRepPortal-table-container">
          <div className="ClassRepPortal-table-responsive">
            <table className="ClassRepPortal-table">
              <thead className="ClassRepPortal-thead">
                <tr>
                  <th className="ClassRepPortal-th center w-id">ID</th>
                  <th className="ClassRepPortal-th">Student Details</th>
                  <th className="ClassRepPortal-th">Admission Number</th>
                  <th className="ClassRepPortal-th center w-status">Attendance Status</th>
                  <th className="ClassRepPortal-th">Absent Reason</th>
                  <th className="ClassRepPortal-th center w-verify">Status</th>
                </tr>
              </thead>
              <tbody>
              {students.map((student) => (
                <tr key={student.id} className="ClassRepPortal-tr">
                  <td className="ClassRepPortal-td center ClassRepPortal-td-roll">{student.rollNo}</td>
                  <td className="ClassRepPortal-td ClassRepPortal-td-name">{student.name}</td>
                  <td className="ClassRepPortal-td center">{student.admissionNumber || "—"}</td>
                  <td className="ClassRepPortal-td">
                    {!isLocked ? (
                      <div className="ClassRepPortal-button-pad">
                        {['Present', 'Absent'].map(mode => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => onStatusChange(student.id, mode)}
                            className={`ClassRepPortal-pad-btn ${student.status === mode ? `active-${mode}` : ''}`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="ClassRepPortal-td center">
                        <span className={`ClassRepPortal-badge ${student.status}`}>{student.status}</span>
                      </div>
                    )}
                  </td>
                  <td className="ClassRepPortal-td">
                    {!isLocked ? (
                      <input 
                        type="text"
                        value={student.notes}
                        placeholder="Add remark..."
                        onChange={(e) => onNoteChange(student.id, e.target.value)}
                        className="ClassRepPortal-input-note"
                      />
                    ) : (
                      <span className="ClassRepPortal-text-italic">{student.notes || "—"}</span>
                    )}
                  </td>
                  <td className="ClassRepPortal-td center">
                    <span className={`ClassRepPortal-status-text ${student.verified ? 'approved' : 'awaiting'}`}>
                      {student.verified ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      {student.verified ? 'Approved' : 'Awaiting Review'}
                    </span>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}