import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundry';
function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/board" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/board" element={token ?  <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary> : <Navigate to="/login" />} />
      </Routes>
    </Router>

  );
}

export default App;
