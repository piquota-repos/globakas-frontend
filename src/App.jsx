import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Reports from './pages/Reports.jsx';

const App = () => {
  return (
    <Router>
      <Routes> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/reports" element={<Reports />} /> 
        <Route path="/" element={<Login />} />  
      </Routes>
    </Router>
  );
};

export default App;
