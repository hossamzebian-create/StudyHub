import { useState, useEffect } from 'react';
import api from '../api';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examDate, setExamDate] = useState('');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [exmRes, crsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/db-courses')
      ]);
      setExams(exmRes.data);
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

  const handleAddExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams', {
        title,
        description,
        exam_date: examDate,
        course_id: courseId
      });
      setTitle('');
      setDescription('');
      setExamDate('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add exam');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete exam?')) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Exams</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Exam</h3>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleAddExam} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="form-group">
            <label>Exam Title</label>
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
            <label>Exam Date</label>
            <input type="date" className="input-field" value={examDate} onChange={e => setExamDate(e.target.value)} required />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Description (Optional)</label>
            <textarea className="input-field" value={description} onChange={e => setDescription(e.target.value)} rows="2"></textarea>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">Add Exam</button>
          </div>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {exams.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No exams scheduled yet.</p>
        ) : (
          exams.map(exam => (
            <div key={exam.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{exam.title}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{new Date(exam.exam_date).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete(exam.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
