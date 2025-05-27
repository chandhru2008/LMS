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
import LeaveCalendar from './components/LeaveCalendar/LeaveCalendarBody.tsx'




const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  }, 
  {
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
        if (data.role != 'hr' || data.role !='hr_manager') {
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
  }, {
    path : "Calender",
    element : <LeaveCalendar />
  }
])
createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
