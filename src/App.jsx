import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Reports from './pages/Reports.jsx';
import LandingPage from './pages/LandingPage.jsx';
import '../src/assets/config/i18n';

const App = () => {
  return (
    <Router>
      <Routes> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/reports" element={<Reports />} /> 
        <Route path="/globakas" element={<LandingPage />} /> 
        <Route path="/" element={<Login />} />  
      </Routes>
    </Router>
  );
};

export default App;
