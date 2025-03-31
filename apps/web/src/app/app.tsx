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
            <Route
              path="/register"
              element={<Navigate to="/register/events" replace />}
            />
            <Route path="/register">
              <Route path="events" element={<EventsRegister />} index />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
