import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Navbar from '../components/NavBar';
import Dashboard from '../pages/Dashboard';
import EventsRegister from '../pages/EventsRegister';
import '../styles.css';
import YieldRegister from '../pages/YieldRegister';
import ProjectionPage from '../pages/ProjectionPage';

function App() {
  return (
    <Router>
      <div className="main-container">
        <div
          style={{
            width: '100%',
            backgroundColor: '#026734',
          }}
        >
          <Navbar />
        </div>
        <div style={{ height: '100%', width: '100%' }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projection" element={<ProjectionPage />} />
            <Route
              path="/register"
              element={<Navigate to="/register/yield" replace />}
            />
            <Route path="/register">
              <Route path="yield" element={<YieldRegister />} />
              <Route path="event" element={<EventsRegister />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;