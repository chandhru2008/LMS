import  {  useState } from 'react';
import { json, useNavigate } from 'react-router-dom';
function Registration() {

  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [passowrd, setPassword] = useState('');
  const [conformPassword, setConformPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [role, setRole] = useState('');
  const [managerEmail, setManagerEmail] = useState('');


  async function handleSignUp() {
    const ValidEmailregex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    function errorMessage(e: string) {
      setTimeout(() => {
        setErrorMessage('');
      }, 3000)
      setErrorMessage(e);
    }
    if (email.length == 0) {
      errorMessage("Email is required");
    } else if (!ValidEmailregex.test(email)) {
      errorMessage("Enter a valid Email");
    }else if(!strongPasswordRegex.test(passowrd)){
      errorMessage("Enter a strong password")
    } else if (passowrd != conformPassword) {
      errorMessage("Password is miss matching");
    } else if (role == "employee" && managerEmail.length == 0) {
      errorMessage("Eanager email should not be empty");
    } else if (role == "employee" && !ValidEmailregex.test(managerEmail)) {
      errorMessage("Enter a valid manager");
    }



    else {

      const userDetails = {
        name : name,
        email : email,
        password : passowrd,
        role : role,
        managerEmail : managerEmail
      }

      const respond = await fetch("http://localhost:3001/register", {
        method: "post",
        credentials : 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userDetails)
      });
      if (respond.ok) {
        console.log(respond);
        const data = await respond.json();
        console.log(data);
        // navigate("/");
      } else {
        const data = await respond.json();
        console.log(data);
      }
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
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setConformPassword(e.target.value)}
          />
          <select defaultValue="" className='px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500' onChange={(e) => setRole(e.target.value)}>
            <option value="" disabled hidden >Role</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="director">Director</option>
            <option value="HR">HR</option>
          </select>{
            role == "employee" &&
            <input
              type="email"
              placeholder="Manager Email"
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setManagerEmail(e.target.value)}
            />
          }

          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            onClick={(e) => { e.preventDefault(), handleSignUp() }}
          >
            Register
          </button>
          <span className='text-red'>{errorMessage}</span>
        </form>
      </div>
    </div>
  );
};

export default Registration;
