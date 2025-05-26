import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Home from './pages/home';
import InsightsDashboard from './pages/InsightsDashboard';
import AICodeReview from './pages/AICodeReview';
import CommitValidator from './pages/CommitValidator';
import AutoDocstrings from './pages/AutoDocstrings';
import VulnerabilityScan from './pages/VulnerabilityScan';
import CommitHistory from './pages/CommitHistory';
import CodebaseExplorer from './pages/CodebaseExplorer';
import Landing from './pages/landing';

const AppContent = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/ai-code-review" element={<AICodeReview />} />
          <Route path="/commit-validator" element={<CommitValidator />} />
          <Route path="/insights-dashboard" element={<InsightsDashboard />} />
          <Route path="/auto-docstrings" element={<AutoDocstrings />} />
          <Route path="/vulnerability-scan" element={<VulnerabilityScan />} />
          <Route path="/commit-history" element={<CommitHistory />} />
          <Route path="/codebase-explorer" element={<CodebaseExplorer />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;