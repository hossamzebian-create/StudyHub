import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api';
import { toast } from 'react-toastify';

const localizer = momentLocalizer(moment);

// We use a static reference week in the past to anchor the recurring events.
// Jan 1, 2024 was a Monday.
const referenceDays = {
  0: '2024-01-07', // Sunday
  1: '2024-01-01', // Monday
  2: '2024-01-02', // Tuesday
  3: '2024-01-03', // Wednesday
  4: '2024-01-04', // Thursday
  5: '2024-01-05', // Friday
  6: '2024-01-06'  // Saturday
};

export default function WeeklySchedule() {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);

  const [courseId, setCourseId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('1'); // Default to Monday
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [schedRes, crsRes] = await Promise.all([
        api.get('/course-schedules'),
        api.get('/db-courses')
      ]);

      const formattedSchedules = schedRes.data.map(s => {
        const dateStr = referenceDays[s.day_of_week];
        return {
          id: s.id,
          title: `${s.course_code} - ${s.course_name}`,
          start: new Date(`${dateStr}T${s.start_time}`),
          end: new Date(`${dateStr}T${s.end_time}`),
          day_of_week: s.day_of_week.toString(),
          start_time_str: s.start_time,
          end_time_str: s.end_time
        };
      });

      setSchedules(formattedSchedules);
      setCourses(crsRes.data);
      if (crsRes.data.length > 0 && !courseId) {
        setCourseId(crsRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load schedule data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    const timeToMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const newStartMins = timeToMins(startTime);
    const newEndMins = timeToMins(endTime);

    const hasOverlap = schedules.some(s => {
      if (s.day_of_week !== dayOfWeek) return false;
      const existingStartMins = timeToMins(s.start_time_str);
      const existingEndMins = timeToMins(s.end_time_str);
      return newStartMins < existingEndMins && newEndMins > existingStartMins;
    });

    if (hasOverlap) {
      setError('Cannot add course: This time slot overlaps with an existing course on this day.');
      toast.error('Overlapping course times are not allowed!');
      return;
    }

    try {
      await api.post('/course-schedules', {
        course_id: courseId,
        day_of_week: parseInt(dayOfWeek),
        start_time: startTime,
        end_time: endTime
      });
      setStartTime('');
      setEndTime('');
      setError('');
      toast.success('Class added to schedule!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add class');
    }
  };

  const handleSelectEvent = async (event) => {
    if (window.confirm(`Delete "${event.title}" from your weekly schedule?`)) {
      try {
        await api.delete(`/course-schedules/${event.id}`);
        toast.success('Class removed');
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error('Failed to remove class');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Weekly Course Schedule</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add Recurring Class</h3>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleAddClass} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="form-group">
            <label>Course</label>
            <select className="input-field" value={courseId} onChange={e => setCourseId(e.target.value)} required>
              <option value="" disabled>Select a course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Day of Week</label>
            <select className="input-field" value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)} required>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
              <option value="0">Sunday</option>
            </select>
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
            <button type="submit" className="btn btn-primary">Add to Weekly Timetable</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ height: '700px', padding: '1rem' }}>
        <Calendar
          localizer={localizer}
          events={schedules}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['week']} // Only allow week view
          toolbar={false} // Hide toolbar since it's a fixed repeating schedule
          defaultDate={new Date('2024-01-01T00:00:00')} // Anchor date
          min={new Date('2024-01-01T08:00:00')} // Restrict to 8 AM
          max={new Date('2024-01-01T20:00:00')} // Restrict to 8 PM
          step={30}
          timeslots={2}
          onSelectEvent={handleSelectEvent}
          formats={{
            dayFormat: (date, culture, localizer) =>
              localizer.format(date, 'dddd', culture) // Only show "Monday", "Tuesday", hiding the specific date
          }}
          eventPropGetter={(event) => {
            const colors = [
              '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6'
            ];
            const colorIndex = (event.id * 13) % colors.length;
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
