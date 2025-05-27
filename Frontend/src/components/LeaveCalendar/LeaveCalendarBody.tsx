import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, type EventProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EmployeeSidebar from './EmployeeSideBar';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const colors = ["#f44336", "#2196f3", "#4caf50", "#ff9800", "#9c27b0", "#00bcd4", "#607d8b"];

function getColor(index: number): string {
  return colors[index % colors.length];
}

interface LeaveType {
  id: string;
  name: string;
}

interface LeaveEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  status: string;
  employeeName: string;
  leaveTypeName: string;
  email: string;
}

interface ApiLeaveData {
  employee: { name: string; email: string };
  leaveType: { name: string };
  start_date: string;
  end_date: string;
  status: string;
}

interface UserInfo {
  role: string;
  id: string;
}

const CustomToolbar: React.FC<{ label: string; onNavigate: (action: "PREV" | "NEXT") => void }> = ({ label, onNavigate }) => {
  const [leaveType, setLeaveType] = useState<LeaveType[]>([]);

  useEffect(() => {
    async function getLeaveType() {
      try {
        const res = await fetch("http://localhost:3001/leave-types", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setLeaveType(data);
      } catch (err) {
        console.error("Error fetching leave types:", err);
      }
    }

    getLeaveType();
  }, []);

  return (
    <div className='flex flex-col gap-4 items-start'>
      <div className='flex gap-2'>
        <button
          onClick={() => onNavigate("PREV")}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Previous
        </button>
        <span className="text-lg font-semibold">{label}</span>
        <button
          onClick={() => onNavigate("NEXT")}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next
        </button>
      </div>
      <div className="flex justify-between items-center p-5 bg-gray-100 rounded w-full mb-5">
        <div className="flex items-center space-x-8 ml-4 overflow-x-auto">
          {leaveType.map((type, index) => (
            <div key={type.id} className="flex items-center space-x-1">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getColor(index) }}
                title={type.name}
              />
              <span className="text-sm">{type.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomEvent: React.FC<EventProps<LeaveEvent>> = ({ event }) => (
  <div style={{ padding: '2px 4px' }}>
    <div style={{ fontSize: 11, opacity: 0.8 }}>{event.leaveTypeName}</div>
    <div>{event.employeeName}</div>
  </div>
);

const LeaveCalendar: React.FC = () => {
  const [events, setEvents] = useState<LeaveEvent[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [leaveTypeColors, setLeaveTypeColors] = useState<Record<string, string>>({});

  const fetchLeaveData = async () => {
    try {
      // Get current user info
      const userRes = await fetch("http://localhost:3001/check-auth", {
        method: "GET",
        credentials: "include",
      });
      const user: UserInfo = await userRes.json();

      let endpoint = "";
  
      if (user.role === "hr" || user.role === "director") {
        endpoint = "http://localhost:3001/all-leave-requests";
      
      } else if (user.role === "hr_manager" || user.role === "manager") {
        endpoint = "http://localhost:3001/all-leave-requests-by-role";
      } else {
        console.warn("Unauthorized or unknown role");
        return;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });

      const data: ApiLeaveData[] = await response.json();
      console.log(data)
      const approvedLeaves = data.filter((leave) => leave.status === 'Approved');

      const uniqueLeaveTypes = Array.from(new Set(approvedLeaves.map((leave) => leave.leaveType.name)));
      const colorMap: Record<string, string> = {};
      uniqueLeaveTypes.forEach((leaveType, index) => {
        colorMap[leaveType] = getColor(index);
      });
      setLeaveTypeColors(colorMap);

      const formattedEvents: LeaveEvent[] = approvedLeaves.map((leave) => ({
        title: 'Leave',
        start: new Date(leave.start_date),
        end: new Date(leave.end_date),
        allDay: true,
        status: leave.status,
        employeeName: leave.employee.name,
        leaveTypeName: leave.leaveType.name,
        email: leave.employee.email,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  function eventStyleGetter(event: LeaveEvent) {
    const backgroundColor = leaveTypeColors[event.leaveTypeName] || '#777';
    const isHighlighted = filteredEmails.length === 0 || filteredEmails.includes(event.email);

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '5px',
        opacity: isHighlighted ? 1 : 0.3,
        fontWeight: isHighlighted ? 'bold' : 'normal',
      },
    };
  }

  return (
    <div className='flex w-full h-screen'>
      <EmployeeSidebar onEmployeeSelect={setFilteredEmails} />
      <div className='flex-1 p-5'>
        <h2 className="text-center text-xl font-semibold mb-4">Leave Calendar</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          views={['month']}
          defaultView="month"
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
            event: CustomEvent,
          }}
          style={{ height: '90vh' }}
        />
      </div>
    </div>
  );
};

export default LeaveCalendar;
