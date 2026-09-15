import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import RanksListModal from '../components/RanksListModal';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [rankData, setRankData] = useState(null);
  const [isRanksListOpen, setIsRanksListOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, rankRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/user/rank')
        ]);
        setData(dashRes.data);
        setRankData(rankRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, []);

  if (!data) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

  return (
    <div>
      <RanksListModal 
        isOpen={isRanksListOpen} 
        onClose={() => setIsRanksListOpen(false)} 
        currentPoints={rankData?.points || 0} 
      />

      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>

      {rankData && (
        <div 
          className="card" 
          onClick={() => setIsRanksListOpen(true)}
          style={{ 
            marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', 
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', 
            border: '2px solid #cbd5e1', cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ fontSize: '5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
            {rankData.details.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
              Daily Rank: <span style={{ color: '#3b82f6' }}>{rankData.details.rank}</span>
            </h2>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '1.1rem' }}>
              Daily Study Time: <strong>{rankData.points} mins</strong>
            </p>
            {rankData.details.next && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#475569' }}>
                  <span>Progress to {rankData.details.next}</span>
                  <span>{rankData.points} / {rankData.details.max}</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
                    width: `${((rankData.points - rankData.details.min) / (rankData.details.max - rankData.details.min)) * 100}%` 
                  }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', margin: 0 }}>{data.stats.total_courses}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Total Courses</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--danger-color)', margin: 0 }}>{data.stats.pending_assignments}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Pending Assignments</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--success-color)', margin: 0 }}>{data.stats.completed_assignments}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Completed Assignments</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3>Upcoming Assignments</h3>
          {data.upcoming_assignments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No upcoming assignments.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.upcoming_assignments.map(a => (
                <li key={a.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <strong>{a.title}</strong> - Due {new Date(a.due_date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
          <Link to="/assignments" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>View All</Link>
        </div>

        <div className="card">
          <h3>Upcoming Exams</h3>
          {data.upcoming_exams.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No upcoming exams.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.upcoming_exams.map(e => (
                <li key={e.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <strong>{e.title}</strong> - {new Date(e.exam_date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
          <Link to="/exams" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>View All</Link>
        </div>
      </div>
    </div>
  );
}
