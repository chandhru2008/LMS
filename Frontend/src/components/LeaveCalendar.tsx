import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, type EventProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface LeaveEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  status: string;
  description: string;
  employeeName: string;
  leaveTypeName: string;
}

interface ApiLeaveData {
  employee: { name: string };
  leaveType: { name: string };
  start_date: string;
  end_date: string;
  status: string;
  description: string;
}

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom event component to format event display
const CustomEvent: React.FC<EventProps<LeaveEvent>> = ({ event }) => {
  return (
    <div style={{ padding: '2px 4px' }}>
      <div>
        <strong>{event.employeeName}</strong> took leave from{' '}
        <span style={{ color: '#1E90FF', fontWeight: 'bold' }}>
          {format(event.start, 'MMM d, yyyy')}
        </span>{' '}
        to{' '}
        <span style={{ color: '#1E90FF', fontWeight: 'bold' }}>
          {format(event.end, 'MMM d, yyyy')}
        </span>
      </div>
      <div style={{ fontSize: 11, opacity: 0.8 }}>{event.leaveTypeName}</div>
    </div>
  );
};

const LeaveCalendar: React.FC = () => {
  const [events, setEvents] = useState<LeaveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveData = async () => {
    try {
      const response = await fetch('http://localhost:3002/all-leave-requests',{
        method : "GET",
        credentials : 'include'
      });
      const data: ApiLeaveData[] = await response.json();

      const formattedEvents: LeaveEvent[] = data.map((leave) => ({
        title: `${leave.employee.name} - ${leave.leaveType.name}`, // fallback if needed
        start: new Date(leave.start_date),
        end: new Date(leave.end_date),
        allDay: true,
        status: leave.status,
        description: leave.description,
        employeeName: leave.employee.name,
        leaveTypeName: leave.leaveType.name,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const eventStyleGetter = (event: LeaveEvent) => {
    let backgroundColor = 'gray';

    if (event.status === 'Approved') backgroundColor = 'green';
    else if (event.status === 'Pending') backgroundColor = 'orange';
    else if (event.status === 'Rejected') backgroundColor = 'red';
    else if (event.status === 'Cancelled') backgroundColor = 'lightgray';

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '5px',
        padding: '4px',
      },
    };
  };

  if (loading) return <p>Loading calendar...</p>;

  return (
    <div style={{ height: '90vh', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Leave Calendar</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        tooltipAccessor="description"
        titleAccessor="title"
        eventPropGetter={eventStyleGetter}
        components={{
          event: CustomEvent,
        }}
        style={{ height: '80vh' }}
      />
    </div>
  );
};

export default LeaveCalendar;
