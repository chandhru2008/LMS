import Header from './components/Header'
import './App.css'
import DashBoard from './components/DashBoard'
import Footer from './components/Footer'



function App() {


  return (
      <div className='flex flex-col min-h-[100vh] justify-between'>
        <Header />
        <DashBoard />
        <Footer />
      </div>
  )
}

export default App
