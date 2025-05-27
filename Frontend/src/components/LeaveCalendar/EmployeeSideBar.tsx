import React, { useEffect, useState } from 'react';

interface Employee {
  id: number;
  name: string;
  role: string;
  email: string;
}

interface Props {
  onEmployeeSelect: (emails: string[]) => void;
}

const EmployeeSidebar: React.FC<Props> = ({ onEmployeeSelect }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [role, setRole] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('http://localhost:3001/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setRole(data.role);
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    if (!role) return;

    const endpoint =
      role === 'hr' || role === 'director'
        ? 'http://localhost:3001/get-all-employees'
        : 'http://localhost:3001/get-employees-by-role';

    const fetchEmployees = async () => {
      try {
        const res = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [role]);

  const toggleSelection = (email: string) => {
    const updated = selectedEmails.includes(email)
      ? selectedEmails.filter(e => e !== email)
      : [...selectedEmails, email];

    setSelectedEmails(updated);
    onEmployeeSelect(updated);
  };

  return (
    <aside className="w-72 p-6 bg-gray-50 border-r border-gray-200 h-[75vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-800">Team Members</h2>
      <ul className="space-y-4">
        {employees.map((employee) => (
          <li
            key={employee.id}
            onClick={() => toggleSelection(employee.email)}
            className={`cursor-pointer flex items-center p-3 rounded-lg shadow-sm ${
              selectedEmails.includes(employee.email)
                ? 'bg-blue-100'
                : 'bg-white hover:bg-blue-50'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mr-4">
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{employee.name}</div>
              <div className="text-sm text-gray-500">{employee.role}</div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default EmployeeSidebar;
