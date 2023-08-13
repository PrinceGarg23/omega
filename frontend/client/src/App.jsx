import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import BuyerDashboard from './components/Dashboard/BuyerDashboard';
import SellerDashboard from './components/Dashboard/SellerDashboard';

function App() {
  return (
    <Router basename='/'>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/buyer" />} />
        <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
        <Route path="/dashboard/seller" element={<SellerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
