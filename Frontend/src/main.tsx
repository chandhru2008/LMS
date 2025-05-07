import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/Login'
import Registration from './components/Registration.tsx'
import LeaveType from './components/LeaveType.tsx'


const router = createBrowserRouter([
  {
    path : "/login",
    element : <Login />
  }, {
    path :"/sign-up",
    element : <Registration />
  },
  {
    path : "/",
    element : <App />
  },
  {
    path : "/leave-type",
    element : <LeaveType />
  }
])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
