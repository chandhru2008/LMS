import { useEffect, useState } from 'react';

function Registration() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [role, setRole] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [directorEmail, setDirectorEmail] = useState('');


  function showError(message: string) {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  }

  async function handleSignUp() {
    const validEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!email) return showError("Email is required");
    if (!validEmailRegex.test(email)) return showError("Enter a valid email");
    if (!strongPasswordRegex.test(password)) return showError("Enter a strong password");
    if (password !== confirmPassword) return showError("Passwords do not match");

    if (role === 'employee') {
      if (!managerEmail) return showError("Manager email is required");
      if (!hrEmail) return showError("HR email is required");
      if (!directorEmail) return showError("Director email is required");
      if (!validEmailRegex.test(managerEmail)) return showError("Enter a valid manager email");
    } else if (role === 'manager') {
      if (!hrEmail) return showError("HR email is required");
      if (!directorEmail) return showError("Director email is required");
      if (!validEmailRegex.test(hrEmail)) return showError("Enter a valid HR email");
    } else if (role === 'HR') {
      if (!directorEmail) return showError("Director email is required");
      if (!managerEmail) return showError("Manager email is required");
      if (!validEmailRegex.test(directorEmail)) return showError("Enter a valid director email");
    }

    const userDetails = {
      name,
      email,
      password,
      role,
      managerEmail,
      hrEmail,
      directorEmail
    };

    try {
      const response = await fetch("https://lms-zwod.onrender.com/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      if (!response.ok) {
        const result = await response.json();
        switch (result.message) {
          case 'Enter a valid email':
            showError('Please enter a valid email address.');
            break;
          case 'Email already exists':
            showError('This email is already registered.');
            break;
          case 'Manager does not exist':
            showError('Specified manager does not exist.');
            break;
          case 'HR does not exist':
            showError('Specified HR does not exist.');
            break;
          case 'Director does not exist':
            showError('Specified director does not exist.');
            break;
          default:
            showError(`Error: ${result.message}`);
        }
        return;
      }



    } catch (err) {
      console.error("Network error:", err);
      showError("Something went wrong. Try again.");
    }
  }



  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[90%] max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-[34px] font-semibold text-center mb-6">Create Account</h2>
        <form className="flex flex-col space-y-4 text-[18px]">
          <input
            type="text"
            placeholder="Full Name"
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <select
            defaultValue=""
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="" disabled hidden>Role</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="HR">HR</option>
            <option value="director">Director</option>
          </select>

          {/* Conditional Email Fields */}
          {role === 'employee' && (
            <>
              <input
                type="email"
                placeholder="Manager Email"
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setManagerEmail(e.target.value)}
              />
              <input
                type="email"
                placeholder="HR Email"
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setHrEmail(e.target.value)}
              />
              <input
                type="email"
                placeholder="Director Email"
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setDirectorEmail(e.target.value)}
              />
            </>
          )}
          {role === 'manager' && (
            <>
              <input
                type="email"
                placeholder="HR Email"
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setHrEmail(e.target.value)}
              />
              <input
                type="email"
                placeholder="Director Email"
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setDirectorEmail(e.target.value)}
              />
            </>
          )}
          {role === 'HR' && (
            <>
              <input
                type="email"
                placeholder="Manager Email"
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setManagerEmail(e.target.value)}
              />
              <input
                type="email"
                placeholder="Director Email"
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setDirectorEmail(e.target.value)}
              />
            </>
          )}

          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            onClick={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            Register
          </button>

          {errorMessage && <span className="text-red-600 text-sm">{errorMessage}</span>}
        </form>
      </div>
    </div>
  );
}

export default Registration;
