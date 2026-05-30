import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-inner">
            <div className="logo">
              <span className="logo-icon">✂️</span>
              <span className="logo-text">
                snip<span className="logo-accent">ly</span>
              </span>
            </div>
            <nav className="header-nav">
              <span className="nav-tag">URL Shortener</span>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <footer className="app-footer">
          <p>Built with Node.js · Express · MongoDB · React · NanoID</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
