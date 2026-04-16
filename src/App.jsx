import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TestPd from './pages/TestPd'
import Game from "./pages/Game";
import './App.css'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test-pd" element={<TestPd />} />
        <Route path="/" element={<Game />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

