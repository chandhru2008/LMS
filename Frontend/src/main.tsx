import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom'
import Login from './components/Login'
import Registration from './components/Registration.tsx'
import LeaveType from './components/LeaveType.tsx'
import LeaveRequestForm from './components/leave-request-form.tsx'
import LeaveRequestManager from './components/leave-requests/leave-request-manager.tsx'
import LeaveRequestDirector from './components/leave-requests/leave-request-director.tsx'
import LeaveRequestHr from './components/leave-requests/leave-requet-hr.tsx'



const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  }, {
    path: "/register-employee",
    element: <Registration />,
    loader: async () => {
      try {
        const res = await fetch('http://localhost:3001/check-auth',{
          method : 'GET',
          credentials : 'include'
        });

        if (!res.ok) {
          throw new Error('Authentication check failed');
        }

        const data = await res.json();

        console.log(data);

        if (data.role != 'HR') {
          throw redirect('/'); 
        }

        return null;
      } catch (error) {
        console.error('Auth check error:', error);
        throw redirect('/'); // Redirect to login on any error
      }
    }
  },
{
    path: "/",
    element: <App />
  },
  {
    path: "/leave-type",
    element: <LeaveType />
  },
  {
    path: "/leave-request",
    element: <LeaveRequestForm />
  },
  {
    path: "/manager/leaves",
    element: <LeaveRequestManager />
  },
  {
    path: '/hr/leaves',
    element: <LeaveRequestHr />
  },
  {
    path: "/director/leaves",
    element: <LeaveRequestDirector />
  }
])
createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
