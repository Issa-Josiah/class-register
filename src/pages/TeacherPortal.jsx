import React from 'react';
import './TeacherPortal.css';
import { CheckCircle, Unlock, AlertCircle } from 'lucide-react';
import DashboardMetrics from '../components/DashboardMetrics';

export default function TeacherPortal({ students, isLocked, alwaysEditable, onVerify, onApproveAll, onUnlock }) {
  return (
    <div className="TeacherPortal-main">
      <DashboardMetrics students={students} />

      <div className="TeacherPortal-banner">
        <div className="TeacherPortal-banner-info">
          <CheckCircle className="h-5 w-5" />
          <span><strong>Teacher Section Workspace:</strong> Review rows logged by the representative. Updating verification automatically unlocks access fields for adjustments.</span>
        </div>
        <div className="TeacherPortal-banner-actions">
          {isLocked && (
            <button onClick={onUnlock} className="TeacherPortal-btn-warning">
              <Unlock className="h-3 w-3" /> Reopen Edits
            </button>
          )}
          <button onClick={onApproveAll} className="TeacherPortal-btn-success">
            Verify All Active Records
          </button>
        </div>
      </div>
 
      <div className="TeacherPortal-table-container">
        <div className="TeacherPortal-table-responsive">
          <table className="TeacherPortal-table">
            <thead className="TeacherPortal-thead">
              <tr>
                <th className="TeacherPortal-th center w-id">ID</th>
                <th className="TeacherPortal-th">Student Details</th>
                <th className="TeacherPortal-th">Admission Number</th>
                <th className="TeacherPortal-th center w-status">Attendance Status</th>
                <th className="TeacherPortal-th">Contextual Notes</th>
                <th className="TeacherPortal-th center w-verify">Verification</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="TeacherPortal-tr">
                  <td className="TeacherPortal-td center TeacherPortal-td-roll">{student.rollNo}</td>
                  <td className="TeacherPortal-td TeacherPortal-td-name">{student.name}</td>
                  <td className="TeacherPortal-td center">{student.admissionNumber || "—"}</td>
                  <td className="TeacherPortal-td center">
                    <span className={`TeacherPortal-badge ${student.status}`}>{student.status}</span>
                  </td>
                  <td className="TeacherPortal-td">
                    <span className="TeacherPortal-text-italic">{student.notes || "—"}</span>
                  </td>
                  <td className="TeacherPortal-td center">
                    <button
                      onClick={() => onVerify(student.id)}
                      className={`TeacherPortal-btn-verify ${student.verified ? 'verified' : 'pending'}`}
                    >
                      {student.verified ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5" /> Pending
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="TeacherPortal-footer">
          <span>Showing {students.length} logged student rows</span>
          <p className="TeacherPortal-footer-highlight">
            Verified Status Counter: {students.filter(s => s.verified).length} / {students.length}
          </p>
        </div>
      </div>
    </div>
  );
}