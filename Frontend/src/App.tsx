import Header from './components/Header'
import './App.css'
import LeaveBalances from './components/leave-balance'
import LeaveHistory from './components/leave-history'


function App() {
  
  console.log('App js working...')

  return (
    <>
    <Header />
    <LeaveBalances />
    <LeaveHistory  />
    </>
  )
}

export default App
