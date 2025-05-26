import React, { useEffect, useState } from 'react';

interface Employee {
  id: number;
  name: string;
  role: string;
  email: string;
}

interface Props {
  onEmployeeSelect: (email: string) => void;
}

const EmployeeSidebar: React.FC<Props> = ({ onEmployeeSelect }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [role, setRole] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(false);


  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('https://leave-management-app-2025.netlify.app/check-auth', {
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
      role === 'HR' || role === 'director'
        ? 'https://leave-management-app-2025.netlify.app/get-all-employees'
        : 'https://leave-management-app-2025.netlify.app/get-employees-by-role';

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

  return (
    <aside className="w-72 p-6 bg-gray-50 border-r border-gray-200 h-[75vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-800">Team Members</h2>
      <ul className="space-y-4">
        {employees.map((employee) => (
          <li
            key={employee.id}
            onClick={() => {
              
               selectedEmployee ? setSelectedEmployee(false) : setSelectedEmployee(true); onEmployeeSelect(employee.email) }}
            className={`cursor-pointer flex items-center p-3 rounded-lg shadow-sm ${selectedEmployee ? 'bg-blue-100' : 'bg-white hover:bg-blue-50'
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
