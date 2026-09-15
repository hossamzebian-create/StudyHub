import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api';
import { toast } from 'react-toastify';
import RankUpModal from '../components/RankUpModal';

const localizer = momentLocalizer(moment);

export default function StudyPlan() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [calendarView, setCalendarView] = useState('week');
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const [rankUpData, setRankUpData] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [reflectionText, setReflectionText] = useState('');

  const fetchData = async () => {
    try {
      const [sessRes, crsRes] = await Promise.all([
        api.get('/study-sessions'),
        api.get('/db-courses')
      ]);
      
      let formattedSessions = sessRes.data.map(s => {
        // Parse the date and time strings from PostgreSQL
        const dateStr = s.session_date.split('T')[0];
        return {
          id: s.id,
          title: s.title,
          start: new Date(`${dateStr}T${s.start_time}`),
          end: new Date(`${dateStr}T${s.end_time}`),
          course_id: s.course_id,
          status: s.status,
          isBreak: false,
          session_date: dateStr,
          start_time_str: s.start_time,
          end_time_str: s.end_time
        };
      });

      // --- GENERATE BREAK BLOCKS ---
      // Group by date
      const sessionsByDate = {};
      formattedSessions.forEach(s => {
        const dStr = s.start.toISOString().split('T')[0];
        if (!sessionsByDate[dStr]) sessionsByDate[dStr] = [];
        sessionsByDate[dStr].push(s);
      });

      let breakCounter = 0;
      Object.keys(sessionsByDate).forEach(date => {
        // Sort sessions chronologically for the day
        const daySessions = sessionsByDate[date].sort((a, b) => a.start - b.start);
        
        for (let i = 0; i < daySessions.length - 1; i++) {
          const currentSession = daySessions[i];
          const nextSession = daySessions[i + 1];
          
          // If there is a gap between current session end and next session start
          if (currentSession.end < nextSession.start) {
            formattedSessions.push({
              id: `break-${breakCounter++}`,
              title: '☕ Break Time',
              start: currentSession.end,
              end: nextSession.start,
              isBreak: true
            });
          }
        }
      });
      // -----------------------------

      setSessions(formattedSessions);
      setCourses(crsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load schedule data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    const timeToMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const newStartMins = timeToMins(startTime);
    const newEndMins = timeToMins(endTime);

    const hasOverlap = sessions.some(s => {
      if (s.isBreak) return false;
      if (s.session_date !== selectedDate) return false;
      
      const existingStartMins = timeToMins(s.start_time_str);
      const existingEndMins = timeToMins(s.end_time_str);
      return newStartMins < existingEndMins && newEndMins > existingStartMins;
    });

    if (hasOverlap) {
      setError('Cannot add study block: This time slot overlaps with an existing study block.');
      toast.error('Overlapping study times are not allowed!');
      return;
    }
    
    try {
      await api.post('/study-sessions', {
        title,
        course_id: courseId || null,
        session_date: selectedDate,
        start_time: startTime,
        end_time: endTime
      });
      setTitle('');
      setCourseId('');
      setStartTime('');
      setEndTime('');
      setError('');
      toast.success('Study block added!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add block');
    }
  };

  const handleSelectEvent = (event) => {
    if (event.isBreak) return;
    if (event.status === 'Completed') {
      toast.info('This session is already completed!');
      return;
    }
    setActiveEvent(event);
    setReflectionText('');
  };

  const handleClaimPoints = async () => {
    if (reflectionText.trim().split(/\s+/).length < 3) {
      toast.error('Please write at least a few words about what you studied!');
      return;
    }
    try {
      const res = await api.post(`/study-sessions/${activeEvent.id}/complete`, { reflection: reflectionText });
      toast.success(`Completed! Earned ${res.data.pointsEarned} points!`);
      if (res.data.rankUp) {
        setRankUpData(res.data.newRank);
      }
      setActiveEvent(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete block');
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm(`Are you sure you want to delete "${activeEvent.title}"?`)) {
      try {
        await api.delete(`/study-sessions/${activeEvent.id}`);
        toast.success('Block deleted');
        setActiveEvent(null);
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete block');
      }
    }
  };

  return (
    <div>
      <RankUpModal 
        isOpen={!!rankUpData} 
        newRank={rankUpData} 
        onClose={() => setRankUpData(null)} 
      />
      {activeEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{activeEvent.title}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>What did you accomplish in this session?</p>
            <textarea 
              className="input-field" 
              rows="4" 
              placeholder="Type your reflection here... (min 3 words)"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              style={{ resize: 'none' }}
            ></textarea>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleClaimPoints} style={{ flex: 1 }}>Claim Points!</button>
              <button className="btn btn-danger" onClick={handleDeleteEvent}>Delete</button>
              <button className="btn" onClick={() => setActiveEvent(null)} style={{ border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="page-header">
        <h1 className="page-title">Study Plan</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add Study Block</h3>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleAddSession} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="form-group">
            <label>What are you studying?</label>
            <input type="text" className="input-field" placeholder="e.g. Math Practice" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Course (Optional)</label>
            <select className="input-field" value={courseId} onChange={e => setCourseId(e.target.value)}>
              <option value="">None / General Study</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="input-field" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" className="input-field" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">Add to Plan</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ height: '800px', padding: '1rem' }}>
        <Calendar
          localizer={localizer}
          events={sessions}
          startAccessor="start"
          endAccessor="end"
          views={['week', 'day']}
          view={calendarView}
          onView={setCalendarView}
          date={calendarDate}
          onNavigate={setCalendarDate}
          step={30}
          timeslots={2}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => {
            if (event.isBreak) {
              return {
                style: {
                  backgroundColor: '#E5E7EB', // Tailwind gray-200
                  color: '#4B5563', // Tailwind gray-600
                  borderRadius: '6px',
                  opacity: 0.8,
                  border: '1px dashed #9CA3AF',
                  display: 'block',
                  cursor: 'default'
                }
              };
            }
            // Check if completed
            if (event.status === 'Completed') {
              return {
                style: {
                  backgroundColor: '#10B981', // Green for completed
                  borderRadius: '6px',
                  opacity: 1,
                  color: 'white',
                  border: '2px solid #059669',
                  display: 'block'
                }
              };
            }
            
            const colors = [
              '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6'
            ];
            const colorIndex = (typeof event.id === 'number' ? event.id : 0) * 13 % colors.length;
            return {
              style: {
                backgroundColor: colors[colorIndex],
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block'
              }
            };
          }}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}
