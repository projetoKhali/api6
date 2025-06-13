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
import Login from '../pages/Login';
import ProjectionCustomPage from '../pages/ProjectionCustomPage';
import { useEffect, useState } from 'react';
import ReportPage from '../pages/ReportPage';
import { getLocalStorageData, isUserLoggedIn } from '../store/storage';
import TermsPage from '../pages/Terms';
import TermsModal from '../pages/TermsModal';
import EditUserPage from '../pages/PersonalData';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    isUserLoggedIn().then((result) => setIsAuthenticated(result));
  }, []);

  useEffect(() => {
    setPermissions(getLocalStorageData()?.permissions || []);
  }, [isAuthenticated]);

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
                      <Navbar setIsAuthenticated={setIsAuthenticated} />
                    </div>
                    <div style={{ height: '100%', width: '100%' }}>
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" />}
                        />
                        <Route path="/login" element={<Navigate to="/" />} />

                        {permissions.includes('dashboard') && (
                          <Route path="/dashboard" element={<Dashboard />} />
                        )}

                        {permissions.includes('register') && (
                          <>
                            <Route
                              path="/register"
                              element={
                                <Navigate to="/register/yield" replace />
                              }
                            />
                            <Route
                              path="/register/yield"
                              element={<YieldRegister />}
                            />
                            <Route
                              path="/register/event"
                              element={<EventsRegister />}
                            />
                            <Route
                              path="/user"
                              element={<UserManagementPage />}
                            />
                          </>
                        )}

                        {permissions.includes('analitic') && (
                          <>
                            <Route
                              path="/projection"
                              element={<ProjectionPage />}
                            />
                            <Route
                              path="/prevision"
                              element={<ProjectionCustomPage />}
                            />
                            <Route path="/report" element={<ReportPage />} />
                          </>
                        )}

                        <Route path="/user-data" element={<EditUserPage />} />

                        <Route
                          path="/terms-acceptance"
                          element={
                            <TermsModal
                              onAccept={() => {
                                /* handle accept */
                              }}
                              setIsAuthenticated={setIsAuthenticated}
                            />
                          }
                        />
                        <Route path="/terms" element={<TermsPage />} />
                      </Routes>
                    </div>
                  </>
                }
              />
            </Routes>
          ) : (
            <Routes>
              <Route
                path="/login"
                element={<Login setIsAuthenticated={setIsAuthenticated} />}
              />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
