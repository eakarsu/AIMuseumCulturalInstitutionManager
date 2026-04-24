import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AIFeatures from './pages/AIFeatures';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ai-tools" element={<ProtectedRoute><AIFeatures /></ProtectedRoute>} />
      <Route path="/:feature" element={<ProtectedRoute><FeaturePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
