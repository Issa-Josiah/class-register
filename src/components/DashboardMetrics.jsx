import React from 'react';
import './DashboardMetrics.css';
import { Users, UserCheck, UserX } from 'lucide-react';

export default function DashboardMetrics({ students = [] }) {
  const total = students.length;
  const present = students.filter(s => s.status === 'Present').length;
  const absent = students.filter(s => s.status === 'Absent').length;

  return (
    <div className="DashboardMetrics-grid">
      <div className="DashboardMetrics-card total">
        <div>
          <p className="DashboardMetrics-card-label">Total Class</p>
          <h3 className="DashboardMetrics-card-value">{total}</h3>
        </div>
        <Users className="DashboardMetrics-card-icon total" />
      </div>
      <div className="DashboardMetrics-card present">
        <div>
          <p className="DashboardMetrics-card-label">Present</p>
          <h3 className="DashboardMetrics-card-value present">{present}</h3>
        </div>
        <UserCheck className="DashboardMetrics-card-icon present" />
      </div>
     
      <div className="DashboardMetrics-card absent">
        <div>
          <p className="DashboardMetrics-card-label">Absent</p>
          <h3 className="DashboardMetrics-card-value absent">{absent}</h3>
        </div>
        <UserX className="DashboardMetrics-card-icon absent" />
      </div>
    </div>
  );
}