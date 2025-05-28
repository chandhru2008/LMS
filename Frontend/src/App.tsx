import Header from './components/Header'
import './App.css'
import DashBoard from './components/DashBoard'
import Footer from './components/Footer'
import LeaveCalendar from './components/LeaveCalendar/LeaveCalendarBody'


function App() {
  
  console.log('App js working...')

  return (
    <div className='flex flex-col min-h-[100vh] justify-between'>
    <Header />
    <DashBoard />
    <Footer />
    </div>
  )
}

export default App
