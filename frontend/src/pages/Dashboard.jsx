import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../api';

const features = [
  { key: 'collections', title: 'Collections', description: 'Manage collection accession & deaccession', icon: '🎨', color: '#c9a84c' },
  { key: 'objects', title: 'Object Records', description: 'Provenance, condition, location & photos', icon: '🏺', color: '#8B4513' },
  { key: 'loans', title: 'Loan Management', description: 'Track incoming & outgoing loans', icon: '🤝', color: '#2E86AB' },
  { key: 'exhibitions', title: 'Exhibitions', description: 'Plan & schedule exhibitions', icon: '🖼️', color: '#6b2737' },
  { key: 'galleries', title: 'Galleries', description: 'Gallery assignment & management', icon: '🏛️', color: '#4A5568' },
  { key: 'conservation', title: 'Conservation', description: 'Condition reports & treatments', icon: '🔬', color: '#38A169' },
  { key: 'environment', title: 'Environment', description: 'Temperature, humidity & light monitoring', icon: '🌡️', color: '#00B4D8' },
  { key: 'storage', title: 'Storage', description: 'Track storage locations & inventory', icon: '📦', color: '#7B6D8D' },
  { key: 'insurance', title: 'Insurance & Valuation', description: 'Policies, coverage & appraisals', icon: '🛡️', color: '#E76F51' },
  { key: 'ticketing', title: 'Ticketing', description: 'Admissions & ticket management', icon: '🎫', color: '#9B5DE5' },
  { key: 'memberships', title: 'Memberships', description: 'Member tiers, benefits & renewals', icon: '💳', color: '#F15BB5' },
  { key: 'donors', title: 'Donors', description: 'Gifts, pledges & stewardship', icon: '💝', color: '#FF6B6B' },
  { key: 'giftshop', title: 'Gift Shop', description: 'POS, inventory & sales', icon: '🛍️', color: '#00BBF9' },
  { key: 'events', title: 'Events', description: 'Event space rental & management', icon: '🎭', color: '#FEE440' },
  { key: 'education', title: 'Education', description: 'Program registration & content', icon: '📚', color: '#43AA8B' },
  { key: 'volunteers', title: 'Volunteers', description: 'Docent & volunteer scheduling', icon: '🙋', color: '#577590' },
  { key: 'tours', title: 'Tours', description: 'Tour booking & management', icon: '🗺️', color: '#F3722C' },
  { key: 'visitors', title: 'Visitor Analytics', description: 'Traffic, demographics & insights', icon: '📊', color: '#277DA1' },
  { key: 'security', title: 'Security', description: 'Rounds tracking & incident reports', icon: '🔒', color: '#4D908E' },
  { key: 'maintenance', title: 'Maintenance', description: 'Facility maintenance requests', icon: '🔧', color: '#90BE6D' },
  { key: 'ai-tools', title: 'AI Tools', description: 'AI-powered content generation', icon: '🤖', color: '#c9a84c' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Admin';

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-logo">🏛️</span>
          <span className="navbar-brand">Museum Manager</span>
        </div>
        <div className="navbar-center">
          <span className="navbar-title">Dashboard</span>
        </div>
        <div className="navbar-right">
          <span className="navbar-user">{userName}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-header">
        <h1>Welcome to Museum Manager</h1>
        <p className="dashboard-date">{today}</p>
      </div>

      <div className="dashboard">
        {features.map((feature) => (
          <div
            key={feature.key}
            className="card"
            onClick={() => navigate(`/${feature.key}`)}
          >
            <div
              className="card-icon"
              style={{ backgroundColor: feature.color }}
            >
              {feature.icon}
            </div>
            <div className="card-title">{feature.title}</div>
            <div className="card-description">{feature.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
