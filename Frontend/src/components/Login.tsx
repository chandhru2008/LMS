import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, setLogin, fetchAuth } = useAuth();


  useEffect(() => {
    if (login) { console.log(login); navigate('/'); }
  }, [login, navigate])


  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {


    e.preventDefault();


    const validEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!validEmailRegex.test(email)) {
      setErrorMessage('Enter a valid email');
      return;
    }

    try {
      const userData = { email, password };

      const response = await fetch('https://lms-zwod.onrender.com/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Invaild password' || errorData.message === 'Employee not found') {
          setErrorMessage(errorData.message);
        } else {
          setErrorMessage(errorData.message);
        }
      } else {
        const data = await response.json();
        localStorage.setItem('role', data.role);
        await fetchAuth();
        setLogin(true)
        navigate('/')
      }

    } catch (err) {
      console.log('Error in login :', err);
      setErrorMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[90%] max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>
        {errorMessage && (
          <p className="text-red-600 text-sm text-center mt-2">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}

export default Login;
