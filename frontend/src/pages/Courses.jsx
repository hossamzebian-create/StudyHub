import { useState, useEffect } from 'react';
import api from '../api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    try {
      // NOTE: backend endpoint for getting all courses is /api/db-courses in the original server.js
      // Wait, let's just use /api/db-courses
      const res = await api.get('/db-courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', { name, code });
      setName('');
      setCode('');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add course');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Courses</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Course</h3>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleAddCourse} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label>Course Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Data Structures"
              required 
            />
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label>Course Code</label>
            <input 
              type="text" 
              className="input-field" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              placeholder="e.g. CS201"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary">Add Course</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {courses.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No courses added yet. Add one above!</p>
        ) : (
          courses.map(course => (
            <div key={course.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{course.code}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{course.name}</p>
              </div>
              <button onClick={() => handleDelete(course.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
