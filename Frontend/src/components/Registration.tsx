import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Registration() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [showPassword, setShowPassword] = useState(false);
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
    const strongPasswordRegex =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
    if (!email) return showError("Email is required");
    if (!validEmailRegex.test(email)) return showError("Enter a valid email");
    if (!strongPasswordRegex.test(password)) return showError("Enter a strong password");
    if (password !== confirmPassword) return showError("Passwords do not match");
  
    // Validate fields based on role
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
      managerEmail: managerEmail,
      hrEmail: hrEmail,
      directorEmail: directorEmail
    };
    
  console.log(userDetails)
    try {
      const response = await fetch("https://lms-zwod.onrender.com/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });
  
      const data = await response.json();
      
  
      if (response.ok) {
        console.log("Registered:", data);
        navigate("/home");  
      } else {
        console.log("therheuf")
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
            type= 'password'
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
            <div>
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
            </div>
          )}
          {role === 'manager' && (
            <div>
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
            </div>
          )}
          {role === 'HR' && (
            <div>
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
            </div>
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
          {errorMessage && <span className="text-red-600 text-sm">{"fdighjvoifsdc"}</span>}
        </form>
      </div>
    </div>
  );
}

export default Registration;
