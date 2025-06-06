import { useState, useEffect } from 'react';
import type { IUserDetails } from '../types';

interface IManager {
  email: string;
  name: string;
}

function Registration() {
  const [formData, setFormData] = useState<IUserDetails>({
    name: '',
    email: '',
    password: '',
    role: '' as  | 'hr' | 'hr_manager' | 'director' | 'manager' | 'employee',
    gender: '',
    maritalStatus: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [managers, setManagers] = useState<IManager[]>([]);
  const [hrManagers, setHrManagers] = useState<IManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.role === 'employee') {
      fetchManagers();
    } else if (formData.role === 'hr') {
      fetchHrManagers();
    }
  }, [formData.role]);

  const fetchManagers = async () => {
    try {
      const res = await fetch('https://lms-zwod.onrender.com/get-all-managers', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setManagers(data);
      }
    } catch (err) {
      console.error('Failed to fetch managers:', err);
    }
  };

  const fetchHrManagers = async () => {
    try {
      const res = await fetch('https://lms-zwod.onrender.com/get-all-hr-managers', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setHrManagers(data);
      }
    } catch (err) {
      console.error('Failed to fetch HR managers:', err);
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.name) errors.name = 'Full name is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validEmailRegex.test(formData.email)) {
      errors.email = 'Enter a valid email';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!strongPasswordRegex.test(formData.password)) {
      errors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
    }
    if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.role) errors.role = 'Please select a role';
    if (!formData.gender) errors.gender = 'Please select gender';
    if (!formData.maritalStatus) errors.maritalStatus = 'Please select marital status';
    
    if (formData.role === 'employee' && !formData.managerEmail) {
      errors.managerEmail = 'Please select your manager';
    }
    if (formData.role === 'hr' && !formData.hrManagerEmail) {
      errors.hrManagerEmail = 'Please select your HR manager';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://lms-zwod.onrender.com/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        showError(result.message || 'Registration failed');
        return;
      }

      showSuccess('Registration successful! You will be redirected shortly...');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error(err);
      showError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create New Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please fill in the form to register
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${formErrors.email ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${formErrors.password ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${formErrors.role ? 'border-red-300' : 'border-gray-300'} text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                value={formData.role || ''}
                onChange={handleChange}
              >
                <option value="" disabled>Select your role</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="hr_manager">HR Manager</option>
                <option value="director">Director</option>
              </select>
              {formErrors.role && <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${formErrors.gender ? 'border-red-300' : 'border-gray-300'} text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                value={formData.gender || ''}
                onChange={handleChange}
              >
                <option value="" disabled>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {formErrors.gender && <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>}
            </div>

            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${formErrors.maritalStatus ? 'border-red-300' : 'border-gray-300'} text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                value={formData.maritalStatus || ''}
                onChange={handleChange}
              >
                <option value="" disabled>Select marital status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
              {formErrors.maritalStatus && <p className="mt-1 text-sm text-red-600">{formErrors.maritalStatus}</p>}
            </div>

            {formData.role === 'employee' && (
              <div>
                <label htmlFor="managerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Manager
                </label>
                <select
                  id="managerEmail"
                  name="managerEmail"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${formErrors.managerEmail ? 'border-red-300' : 'border-gray-300'} text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  value={formData.managerEmail || ''}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select your manager</option>
                  {managers.map((manager) => (
                    <option key={manager.email} value={manager.email}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
                {formErrors.managerEmail && <p className="mt-1 text-sm text-red-600">{formErrors.managerEmail}</p>}
              </div>
            )}

            {formData.role === 'hr' && (
              <div>
                <label htmlFor="hrManagerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  HR Manager
                </label>
                <select
                  id="hrManagerEmail"
                  name="hrManagerEmail"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${formErrors.hrManagerEmail ? 'border-red-300' : 'border-gray-300'} text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  value={formData.hrManagerEmail || ''}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select your HR manager</option>
                  {hrManagers.map((hrManager) => (
                    <option key={hrManager.email} value={hrManager.email}>
                      {hrManager.name} ({hrManager.email})
                    </option>
                  ))}
                </select>
                {formErrors.hrManagerEmail && <p className="mt-1 text-sm text-red-600">{formErrors.hrManagerEmail}</p>}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Register'}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{errorMessage}</h3>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Registration;