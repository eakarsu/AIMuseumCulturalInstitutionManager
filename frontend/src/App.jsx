import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AIFeatures from './pages/AIFeatures';
import EnvironmentMonitor from './pages/EnvironmentMonitor';
import DonorInsights from './pages/DonorInsights';
import AIAdvisor from './pages/AIAdvisor';
import CustomViewsPage from './pages/CustomViewsPage';
import LoanConditionRisk from './pages/LoanConditionRisk';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ai-tools" element={<ProtectedRoute><AIFeatures /></ProtectedRoute>} />
      <Route path="/environment-monitor" element={<ProtectedRoute><EnvironmentMonitor /></ProtectedRoute>} />
      <Route path="/donor-insights" element={<ProtectedRoute><DonorInsights /></ProtectedRoute>} />
      <Route path="/ai-advisor" element={<ProtectedRoute><AIAdvisor /></ProtectedRoute>} />
      <Route path="/custom-views" element={<ProtectedRoute><CustomViewsPage /></ProtectedRoute>} />
      <Route path="/loan-condition-risk" element={<ProtectedRoute><LoanConditionRisk /></ProtectedRoute>} />
      <Route path="/:feature" element={<ProtectedRoute><FeaturePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
