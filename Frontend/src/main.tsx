import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom'
import Login from './components/Login'
import Registration from './components/Registration.tsx'
import LeaveType from './components/LeaveType.tsx'
import LeaveRequestForm from './components/LeaveRequestForm.tsx'
import LeaveRequestManager from './components/LeaveRequestsComponents/LeaveRequestManager.tsx'
import LeaveRequestDirector from './components/LeaveRequestsComponents/LeaveRequestDirector.tsx'
import LeaveRequestHr from './components/LeaveRequestsComponents/LeaveRequetHr.tsx'



const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  }, {
    path: "/register-employee",
    element: <Registration />,
    loader: async () => {
      try {
        const res = await fetch('https://lms-zwod.onrender.com/check-auth',{
          method : 'GET',
          credentials : 'include'
        });

        if (!res.ok) {
          throw new Error('Authentication check failed');
        }

        const data = await res.json();

        console.log(data);

        if (data.role != 'HR' || data.role !='hr_manager') {
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
