import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api';
import { toast } from 'react-toastify';

const localizer = momentLocalizer(moment);

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await api.get('/calendar');
        // Map the backend events to react-big-calendar format
        const formattedEvents = res.data.map(item => ({
          id: item.id,
          title: `[${item.type === 'exam' ? 'EXAM' : 'DUE'}] ${item.title}`,
          start: new Date(item.date),
          end: new Date(item.date),
          allDay: true,
          resource: item
        }));
        setEvents(formattedEvents);
      } catch (err) {
        toast.error('Failed to load calendar events');
        console.error(err);
      }
    };
    fetchCalendar();
  }, []);

  const eventStyleGetter = (event) => {
    let backgroundColor = 'var(--primary-color)';
    if (event.resource.type === 'exam') {
      backgroundColor = 'var(--danger-color)';
    } else if (event.resource.status === 'Completed') {
      backgroundColor = 'var(--success-color)';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Calendar</h1>
      </div>
      
      <div className="card" style={{ height: '70vh', padding: '1rem' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          views={['month', 'agenda']}
          onSelectEvent={event => toast.info(`${event.title} - ${moment(event.start).format('LL')}`)}
        />
      </div>
    </div>
  );
}
