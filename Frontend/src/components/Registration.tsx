import { useState } from 'react';

function Registration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
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
    const validEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!email) return showError('Email is required');
    if (!validEmailRegex.test(email)) return showError('Enter a valid email');
    if (!strongPasswordRegex.test(password))
      return showError('Enter a strong password');
    if (password !== confirmPassword) return showError('Passwords do not match');

    if (!role) return showError('Select a role');

    if (role === 'employee') {
      if (!managerEmail || !validEmailRegex.test(managerEmail))
        return showError('Enter a valid manager email');
    } else if (role === 'HR') {
      if (!hrManagerEmail || !validEmailRegex.test(hrManagerEmail))
        return showError('Enter a valid HR Manager email');
    }

    const userDetails: any = {
      name,
      email,
      password,
      role,
      gender,
      maritalStatus,
    };

    // Add only the relevant supervisor email
    if (role === 'employee') userDetails.managerEmail = managerEmail;
    if (role === 'HR') userDetails.hrManagerEmail = hrManagerEmail;


    try {
      const response = await fetch('https://leave-management-app-2025.netlify.app/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDetails),
      });

      const result = await response.json();

      if (!response.ok) {
        showError(result.message || 'Registration failed');
        return;
      } else {
        setSuccessMessage("Registration Successfull");
        window.location.reload();
      }


    } catch (err) {
      console.error('Network error:', err);
      showError('Something went wrong. Try again.');
    }
  }

  return (
    <div className="w-screen h-full flex items-center justify-center py-12 bg-gray-100">
      <div className="w-[90%] max-w-xl bg-white p-10 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-[28px] font-bold text-center mb-6 text-gray-800">
          Create New Account
        </h2>

        <form className="flex flex-col space-y-4 text-[16px]">
          <input
            type="text"
            placeholder="Full Name"
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <select
            defaultValue=""
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="" disabled hidden>
              Role
            </option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="HR">HR</option>
            <option value="hr_manager">HR Manager</option>
            <option value="director">Director</option>
          </select>

          <select
            defaultValue=""
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="" disabled hidden>
              Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select
            defaultValue=""
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => setMaritalStatus(e.target.value)}
          >
            <option value="" disabled hidden>
              Marital Status
            </option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>

          {(role === 'employee' ||
            role === 'manager' ||
            role === 'HR' ||
            role === 'hr_manager') && (
              <div className="bg-gray-50 p-4 rounded-lg border mt-4 space-y-3">
                <p className="text-lg font-medium text-gray-700">
                  Supervisor Email
                </p>

                {role === 'employee' && (
                  <input
                    type="email"
                    placeholder="Manager Email"
                    className="w-full px-4 py-2 border rounded-lg"
                    onChange={(e) => setManagerEmail(e.target.value)}
                  />
                )}
                {role === 'HR' && (
                  <input
                    type="email"
                    placeholder="HR Manager Email"
                    className="w-full px-4 py-2 border rounded-lg"
                    onChange={(e) => setHrManagerEmail(e.target.value)}
                  />
                )}
              </div>
            )}

          <button
            type="submit"
            className="bg-indigo-600 text-white font-semibold py-2 mt-4 rounded-lg hover:bg-indigo-700 transition"
            onClick={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            Register
          </button>
          {successMessage && (
            <span className="text-red-600 text-sm text-center">
              {successMessage}
            </span>)
          }
          {errorMessage && (
            <span className="text-red-600 text-sm text-center">
              {errorMessage}
            </span>
          )}
        </form>
      </div>
    </div>
  );
}

export default Registration;
