import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './components/Homepage/homepage.jsx'
import BookRecommendations from './components/Homepage/suggestions.jsx'
import './App.css'


function App() {
  return (
    <Router>
      <div>
        {/* <Navigation /> */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/suggestions" element={<BookRecommendations />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App