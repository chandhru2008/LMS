import React, { useEffect, useState } from 'react';
import type { IEmployee } from '../../types';
import { useAuth } from '../AuthProvider';


interface Props {
  onEmployeeSelect: (emails: string[]) => void;
}

const EmployeeSidebar: React.FC<Props> = ({ onEmployeeSelect }) => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [role, setRole] = useState<'hr' | 'hr_manager' | 'director' | 'manager' | 'employee'>();
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const {authData} = useAuth();

  useEffect(() => {
    setRole(authData?.role)
  }, [authData]);

  useEffect(() => {
    if (!role) return;

    const endpoint =
      role === 'hr' || role === 'director'
        ? 'https://lms-zwod.onrender.com/get-all-employees'
        : 'https://lms-zwod.onrender.com/get-employees-by-role';

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
    <aside className="w-60  bg-gray-50 border-r border-gray-200 overflow-y-auto p-[5px]">
      <ul className="space-y-4">
        {employees.map((employee, i) => (
          <li
            key={i}
            onClick={() => toggleSelection(employee.email)}
            className={`cursor-pointer flex items-center p-3 rounded-lg shadow-sm ${selectedEmails.includes(employee.email)
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
