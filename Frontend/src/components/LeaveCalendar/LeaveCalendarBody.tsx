import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, type EventProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EmployeeSidebar from './EmployeeSideBar';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#64748b"];

function getColor(index: number): string {
  return colors[index % colors.length];
}

interface ILeaveType {
  id: string;
  name: string;
}

interface ILeaveEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  status: string;
  employeeName: string;
  leaveTypeName: string;
  email: string;
}

interface IApiLeaveData {
  employee: { name: string; email: string };
  leaveType: { name: string };
  start_date: string;
  end_date: string;
  status: string;
}

interface IUserInfo {
  role: string;
  id: string;
}

const CustomToolbar: React.FC<{ label: string; onNavigate: (action: "PREV" | "NEXT") => void }> = ({ label, onNavigate }) => {
  const [leaveType, setLeaveType] = useState<ILeaveType[]>([]);

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
      <div className='flex gap-4 items-center'>
        <button
          onClick={() => onNavigate("PREV")}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"
        >
          <FaChevronLeft/>
        </button>
        <span className="text-xl font-semibold text-gray-700">{label}</span>
        <button
          onClick={() => onNavigate("NEXT")}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"
        >
          <FaChevronRight />
        </button>
      </div>
      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm w-full mb-3 border border-gray-200">
        <div className="flex items-center space-x-4 overflow-x-auto py-1">
          {leaveType.map((type, index) => (
            <div key={type.id} className="flex items-center space-x-2 shrink-0">
              <span
                className="w-5 h-5 rounded-full shadow-sm"
                style={{ backgroundColor: getColor(index) }}
                title={type.name}
              />
              <span className="text-sm font-medium text-gray-600">{type.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomEvent: React.FC<EventProps<ILeaveEvent>> = ({ event }) => (
  <div className="">
    <div className="text-xs font-[10px] opacity-90">{event.leaveTypeName}</div>
    <div className="font-semibold font-[10px] truncate">{event.employeeName}</div>
  </div>
);

const LeaveCalendar: React.FC = () => {
  const [events, setEvents] = useState<ILeaveEvent[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [leaveTypeColors, setLeaveTypeColors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const fetchLeaveData = async () => {
    try {
      // Get current user info
      const userRes = await fetch("http://localhost:3001/check-auth", {
        method: "GET",
        credentials: "include",
      });
      const user: IUserInfo = await userRes.json();

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

      const data: IApiLeaveData[] = await response.json();

      const approvedLeaves = data.filter((leave) => leave.status === 'Approved');

      const uniqueLeaveTypes = Array.from(new Set(approvedLeaves.map((leave) => leave.leaveType.name)));
      const colorMap: Record<string, string> = {};
      uniqueLeaveTypes.forEach((leaveType, index) => {
        colorMap[leaveType] = getColor(index);
      });
      setLeaveTypeColors(colorMap);

      const formattedEvents: ILeaveEvent[] = approvedLeaves.map((leave) => ({
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

  function eventStyleGetter(event: ILeaveEvent) {
    const backgroundColor = leaveTypeColors[event.leaveTypeName] || '#777';
    const isHighlighted = filteredEmails.length === 0 || filteredEmails.includes(event.email);

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '6px',
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        opacity: isHighlighted ? 1 : 0.3,
        fontWeight: isHighlighted ? 'bold' : 'normal',
        padding: '2px 4px',
      },
    };
  }

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-50">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Calendar</h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <FaHome />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-sm h-full border border-gray-200">
            <h3 className="text-lg font-medium mb-4 text-gray-700">Filter Employees</h3>
            <EmployeeSidebar onEmployeeSelect={setFilteredEmails} />
          </div>
        </div>
        
        {/* Calendar Container */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="h-[calc(100vh-180px)]">
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
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendar;