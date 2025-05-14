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
import UserManagementPage from '../pages/UserManagementPage';
import UserInformation from '../pages/PersonalData';
import Login from '../pages/Login';
import ProjectionCostumPage from '../pages/ProjectionCostumPage';
import { getUserFromLocalStorage } from '../store/UserStorage';
import { useState } from 'react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
    getUserFromLocalStorage() !== null
  );

  return (
    <Router>
      <div className="main-container">
        <div style={{ height: '100%', width: '100%' }}>
          {isAuthenticated ? (
            <Routes>
              <Route
                path="*"
                element={
                  <>
                    <div style={{ width: '100%', backgroundColor: '#026734' }}>
                      <Navbar />
                    </div>
                    <div style={{ height: '100%', width: '100%' }}>
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" />}
                        />
                        <Route path="/login" element={<Navigate to="/" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route
                          path="/projection"
                          element={<ProjectionPage />}
                        />
                        <Route
                          path="/prevision"
                          element={<ProjectionCostumPage />}
                        />
                        <Route path="/user" element={<UserManagementPage />} />
                        <Route
                          path="/register"
                          element={<Navigate to="/register/yield" replace />}
                        />
                        <Route path="/register">
                          <Route path="yield" element={<YieldRegister />} />
                          <Route path="event" element={<EventsRegister />} />
                        </Route>
                        <Route path='/user-data' element={<UserInformation userId={1} />} />
                      </Routes>
                    </div>
                  </>
                }
              />
            </Routes>
          ) : (
            <Routes>
              <Route path="/login" element={<Login
                setIsAuthenticated={setIsAuthenticated}
              />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
