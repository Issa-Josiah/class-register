import React, { useState } from 'react';
import './ClassRepPortal.css';
import { Unlock, Lock, Clock, CheckCircle, UserPlus, ClipboardList } from 'lucide-react';
import DashboardMetrics from '../components/DashboardMetrics';

export default function ClassRepPortal({ students, isLocked, onStatusChange, onNoteChange, onSubmit, onAddStudent }) {
  const [newName, setNewName] = useState('');

  const handleAddClick = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    onAddStudent(newName.trim());
    setNewName(''); // Clear input field after adding
  };

  return (
    <div className="ClassRepPortal-main">
      {/* Dynamic Summary Cards */}
      <DashboardMetrics students={students} />

      {/* Status Warning & Action Banner */}
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
            Submit Logs
          </button>
        )}
      </div>

      {/* Dynamic Student Registration Form (Hidden when register is finalized/locked) */}
      {!isLocked && (
        <form onSubmit={handleAddClick} className="ClassRepPortal-add-card">
          <input 
            type="text"
            value={newName}
            placeholder="Type student name and press Enter or click add..."
            onChange={(e) => setNewName(e.target.value)}
            className="ClassRepPortal-input-text"
          />
          <button type="submit" className="ClassRepPortal-btn-secondary flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Add Student
          </button>
        </form>
      )}

      {/* Conditional Rendering: Table Ledger VS Blank Empty State */}
      {students.length === 0 ? (
        <div className="ClassRepPortal-empty-state">
          <ClipboardList className="ClassRepPortal-empty-icon" />
          <h3>No Students Registered Yet</h3>
          <p>The attendance ledger is currently empty. Use the input field above to start adding the names of students attending today's session.</p>
        </div>
      ) : (
        <div className="ClassRepPortal-table-container">
          <div className="ClassRepPortal-table-responsive">
            <table className="ClassRepPortal-table">
              <thead className="ClassRepPortal-thead">
                <tr>
                  <th className="ClassRepPortal-th center w-id">ID</th>
                  <th className="ClassRepPortal-th">Student Details</th>
                  <th className="ClassRepPortal-th center w-status">Attendance Status</th>
                  <th className="ClassRepPortal-th">Contextual Notes</th>
                  <th className="ClassRepPortal-th center w-verify">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="ClassRepPortal-tr">
                    
                    {/* Incremental system-generated ID number */}
                    <td className="ClassRepPortal-td center ClassRepPortal-td-roll">
                      {student.rollNo}
                    </td>
                    
                    {/* Capitalized full student name profile text */}
                    <td className="ClassRepPortal-td ClassRepPortal-td-name">
                      {student.name}
                    </td>
                    
                    {/* Attendance Switch Pad Modifiers */}
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
                          <span className={`ClassRepPortal-badge ${student.status}`}>
                            {student.status}
                          </span>
                        </div>
                      )}
                    </td>
                    
                    {/* Customizable metadata notation remarks */}
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
                        <span className="ClassRepPortal-text-italic">
                          {student.notes || "—"}
                        </span>
                      )}
                    </td>
                    
                    {/* Live pipeline verification visual track status indication badge */}
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