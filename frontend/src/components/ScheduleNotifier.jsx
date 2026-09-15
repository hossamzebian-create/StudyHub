import { useEffect, useRef, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'study') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'break') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.4); // C5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'class') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880.00, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.15); // C6
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.3); // A5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6
      gain.gain.setValueAtTime(0.05, ctx.currentTime); // Square wave is loud
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  } catch (err) {
    console.error('Audio play failed:', err);
  }
};

export default function ScheduleNotifier() {
  const notifiedEvents = useRef(new Set());
  const [activeFocusCheck, setActiveFocusCheck] = useState(null);
  const [countdown, setCountdown] = useState(120);

  const checkSchedule = async () => {
    try {
      // Fetch both daily study sessions and weekly fixed classes
      const [sessRes, classRes] = await Promise.all([
        api.get('/study-sessions'),
        api.get('/course-schedules')
      ]);

      const todayStr = new Date().toISOString().split('T')[0];
      const todaySessions = sessRes.data.filter(s => s.session_date.split('T')[0] === todayStr);

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTotalMins = currentHour * 60 + currentMinute;
      const todayDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...

      const todayClasses = classRes.data.filter(c => c.day_of_week === todayDayOfWeek);

      todaySessions.forEach(session => {
        // Parse start and end times (format HH:MM:SS)
        const [startH, startM] = session.start_time.split(':').map(Number);
        const [endH, endM] = session.end_time.split(':').map(Number);

        // Check if session is starting RIGHT NOW
        if (currentHour === startH && currentMinute === startM) {
          const notifId = `start-${session.id}`;
          if (!notifiedEvents.current.has(notifId)) {
            sendNotification('Time to Study! 📚', `Your session "${session.title}" has started.`, 'study');
            notifiedEvents.current.add(notifId);
          }
        }

        // Check if session is ending RIGHT NOW (Break starts)
        if (currentHour === endH && currentMinute === endM) {
          const notifId = `end-${session.id}`;
          if (!notifiedEvents.current.has(notifId)) {
            sendNotification('Break Time! ☕', `Great job! Your session "${session.title}" has ended.`, 'break');
            notifiedEvents.current.add(notifId);
          }
        }

        // Focus Check: Every 20 minutes during the session
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        if (currentTotalMins > startMins && currentTotalMins < endMins && session.status !== 'Completed') {
          const minsElapsed = currentTotalMins - startMins;
          if (minsElapsed % 20 === 0) {
            const notifId = `focus-${session.id}-${currentTotalMins}`;
            if (!notifiedEvents.current.has(notifId)) {
              notifiedEvents.current.add(notifId);
              setActiveFocusCheck(session);
              setCountdown(120);
              sendNotification('Focus Check!', 'Are you still studying?', 'default');
            }
          }
        }
      });

      // Check Weekly Classes
      todayClasses.forEach(c => {
        const [startH, startM] = c.start_time.split(':').map(Number);
        const classStartMins = startH * 60 + startM;

        // 10-Minute Warning
        if (classStartMins - currentTotalMins === 10) {
          const notifId = `class-warn-${c.id}`;
          if (!notifiedEvents.current.has(notifId)) {
            sendNotification('Upcoming Class! 🏫', `Your class "${c.course_code}" starts in 10 minutes!`, 'class');
            notifiedEvents.current.add(notifId);
          }
        }

        // Class Starting NOW
        if (classStartMins === currentTotalMins) {
          const notifId = `class-start-${c.id}`;
          if (!notifiedEvents.current.has(notifId)) {
            sendNotification('Class Starting! 🎓', `Your class "${c.course_code}" is starting right now!`, 'class');
            notifiedEvents.current.add(notifId);
          }
        }
      });
    } catch (err) {
      console.error('Failed to check schedule for notifications', err);
    }
  };

  const sendNotification = (title, body, type = 'default') => {
    // Play distinct sound effect based on type
    playSound(type);

    // Show toast inside the app
    toast.info(`${title} - ${body}`, { autoClose: 5000 });

    // Try Desktop Push Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  useEffect(() => {
    // Ask for browser notification permission on mount
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // Run check immediately, then every 30 seconds
    checkSchedule();
    const intervalId = setInterval(checkSchedule, 30000);

    return () => clearInterval(intervalId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let timer;
    if (activeFocusCheck && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (activeFocusCheck && countdown <= 0) {
      handleFailedFocusCheck(activeFocusCheck);
    }
    return () => clearInterval(timer);
  }, [activeFocusCheck, countdown]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFailedFocusCheck = async (session) => {
    setActiveFocusCheck(null);
    toast.error(`You missed the focus check! Session "${session.title}" has been ended early.`);
    try {
      const now = new Date();
      const newEndTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      await api.put(`/study-sessions/${session.id}/end-early`, { new_end_time: newEndTime });
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeFocusCheck) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px', maxWidth: '90%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary-color)' }}>Focus Check!</h2>
        <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Are you still studying "{activeFocusCheck.title}"?</p>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger-color)', marginBottom: '1.5rem' }}>
          {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
        </div>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }} 
          onClick={() => setActiveFocusCheck(null)}
        >
          Yes, I'm still focused!
        </button>
      </div>
    </div>
  );
}
