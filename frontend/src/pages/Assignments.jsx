import { useState, useEffect } from 'react';
import api from '../api';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [assnRes, crsRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/db-courses')
      ]);
      setAssignments(assnRes.data);
      setCourses(crsRes.data);
      if (crsRes.data.length > 0 && !courseId) {
        setCourseId(crsRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', {
        title,
        description,
        due_date: dueDate,
        priority,
        status: 'Pending',
        course_id: courseId
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add assignment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = async (assignment) => {
    try {
      const newStatus = assignment.status === 'Completed' ? 'Pending' : 'Completed';
      await api.put(`/assignments/${assignment.id}`, {
        ...assignment,
        status: newStatus
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Assignments</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Assignment</h3>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleAddAssignment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Course</label>
            <select className="input-field" value={courseId} onChange={e => setCourseId(e.target.value)} required>
              <option value="" disabled>Select a course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" className="input-field" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select className="input-field" value={priority} onChange={e => setPriority(e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Description (Optional)</label>
            <textarea className="input-field" value={description} onChange={e => setDescription(e.target.value)} rows="2"></textarea>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">Add Assignment</button>
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {assignments.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No assignments added yet.</p>
        ) : (
          assignments.map(assn => (
            <div key={assn.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: assn.status === 'Completed' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={assn.status === 'Completed'} 
                  onChange={() => handleStatusToggle(assn)} 
                  style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }}
                />
                <div>
                  <h3 style={{ margin: 0, textDecoration: assn.status === 'Completed' ? 'line-through' : 'none' }}>{assn.title}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Due: {new Date(assn.due_date).toLocaleDateString()} | Priority: <span style={{ color: assn.priority === 'High' ? 'var(--danger-color)' : 'inherit' }}>{assn.priority}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => handleDelete(assn.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
