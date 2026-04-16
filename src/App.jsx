import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TestPd from './pages/TestPd'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test-pd" element={<TestPd />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App