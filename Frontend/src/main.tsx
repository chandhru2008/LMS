import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/Login'
import { AuthProvider } from './components/AuthProvider.tsx'
import LeaveCalendar from './components/LeaveCalendar/LeaveCalendarBody.tsx'




const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/",
    element: <App />
  },
  {
    path: '/calendar',
    element: <LeaveCalendar />
  }
])
createRoot(document.getElementById('root')!).render(
  <AuthProvider><RouterProvider router={router} /></AuthProvider>
)
