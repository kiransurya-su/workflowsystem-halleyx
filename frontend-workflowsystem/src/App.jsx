import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Workflow, List, Activity, Settings, Plus, Box, ShieldCheck, Zap, Sun, Moon } from 'lucide-react';

import WorkflowList from './pages/WorkflowList';
import WorkflowEditor from './pages/WorkflowEditor';
import ExecutionNew from './pages/ExecutionNew';
import ExecutionView from './pages/ExecutionView';
import AuditLog from './pages/AuditLog';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell">
      <nav className="glass-nav liquid-glass">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <Link to="/" className="logo outfit" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div className="logo-icon">
              <Activity size={24} color="#6366f1" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>HalleyX</span>
          </Link>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <Workflow size={18} />
              <span>Workflows</span>
            </Link>
            <Link to="/audit" className={`nav-link ${isActive('/audit') ? 'active' : ''}`}>
              <List size={18} />
              <span>Audit Log</span>
            </Link>
            
            <button 
              onClick={toggleTheme} 
              className="theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2026 HalleyX Workflow System. Premium Business Automation.</p>
        </div>
      </footer>

      <LiquidTaskbar />
    </div>
  );
};

const LiquidTaskbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="liquid-taskbar liquid-glass">
      <Link to="/" className={`taskbar-item ${isActive('/') ? 'active' : ''}`} title="Workflows">
        <Workflow size={24} />
      </Link>
      <Link to="/editor/new" className={`taskbar-item ${isActive('/editor/new') ? 'active' : ''}`} title="New Workflow">
        <Plus size={24} />
      </Link>
      <div className="taskbar-divider"></div>
      <Link to="/audit" className={`taskbar-item ${isActive('/audit') ? 'active' : ''}`} title="Audit Log">
        <Box size={24} />
      </Link>
      <Link to="/execution/new" className={`taskbar-item ${isActive('/execution/new') ? 'active' : ''}`} title="Run Workflow">
        <Zap size={24} />
      </Link>
    </div>
  );
};


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<WorkflowList />} />
          <Route path="/editor/new" element={<WorkflowEditor />} />
          <Route path="/editor/:id" element={<WorkflowEditor />} />
          <Route path="/execution/new" element={<ExecutionNew />} />
          <Route path="/execution/:id" element={<ExecutionView />} />
          <Route path="/audit" element={<AuditLog />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
