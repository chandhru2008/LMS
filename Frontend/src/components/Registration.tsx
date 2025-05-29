import { useState } from 'react';
import type { IUserDetails } from '../types';

function Registration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'hr' | 'hr_manager' | 'director' | 'manager' | 'employee'>();
  const [managerEmail, setManagerEmail] = useState('');
  const [hrManagerEmail, setHrManagerEmail] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');



  function showError(message: string) {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  }

  async function handleSignUp() {
    const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!email) return showError('Email is required');
    if (!validEmailRegex.test(email)) return showError('Enter a valid email');
    if (!strongPasswordRegex.test(password)) return showError('Enter a strong password');
    if (password !== confirmPassword) return showError('Passwords do not match');
    if (!role) return showError('Select a role');

    if (role === 'employee' && (!managerEmail || !validEmailRegex.test(managerEmail)))
      return showError('Enter a valid manager email');

    if (role === 'hr' && (!hrManagerEmail || !validEmailRegex.test(hrManagerEmail)))
      return showError('Enter a valid HR Manager email');

    const userDetails: IUserDetails = {
      name,
      email,
      password,
      role,
      gender,
      maritalStatus,
    };

    if (role === 'employee') userDetails.managerEmail = managerEmail;
    if (role === 'hr') userDetails.hrManagerEmail = hrManagerEmail;

    try {
      const res = await fetch('https://lms-zwod.onrender.com/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDetails),
      });

      const result = await res.json();

      if (!res.ok) {
        showError(result.message || 'Registration failed');
        return;
      }

      setSuccessMessage('Registration successful!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error(err);
      showError('Something went wrong. Try again.');
    }
  }

  return (
    <div className="flex justify-center items-center w-full py-10 h-[60vh] mt-[60px]">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 border">
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">
          Create New Account
        </h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-md"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <select
            className="w-full px-4 py-2 border rounded-md"
            onChange={(e) => setRole(e.target.value  as 'hr' | 'hr_manager' | 'director' | 'manager' | 'employee')}
            defaultValue=""
          >
            <option value="" disabled hidden>
              Select Role
            </option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="hr">HR</option>
            <option value="hr_manager">HR Manager</option>
            <option value="director">Director</option>
          </select>

          <select
            className="w-full px-4 py-2 border rounded-md"
            onChange={(e) => setGender(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled hidden>
              Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select
            className="w-full px-4 py-2 border rounded-md"
            onChange={(e) => setMaritalStatus(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled hidden>
              Marital Status
            </option>
            <option value="single">Single</option>
            <option value="married">Married</option>
          </select>

          {(role === 'employee' || role === 'hr') && (
            <input
              type="email"
              placeholder={role === 'employee' ? 'Manager Email' : 'HR Manager Email'}
              className="w-full px-4 py-2 border rounded-md"
              onChange={(e) =>
                role === 'employee'
                  ? setManagerEmail(e.target.value)
                  : setHrManagerEmail(e.target.value)
              }
            />
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition"
            onClick={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            Register
          </button>

          {errorMessage && (
            <p className="text-red-600 text-sm text-center">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-600 text-sm text-center">{successMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Registration;
