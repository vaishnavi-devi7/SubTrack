import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

function App() {
  const [currentPage, setCurrentPage] = useState<
    'landing' | 'login' | 'dashboard'
  >(localStorage.getItem('token') ? 'dashboard' : 'landing');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
      }}
    >
      {currentPage === 'landing' && (
        <Landing onGetStarted={() => setCurrentPage('login')} />
      )}

      {currentPage === 'login' && (
        <Login onLogin={() => setCurrentPage('dashboard')} />
      )}

      {currentPage === 'dashboard' && <Dashboard />}
    </div>
  );
}

export default App;