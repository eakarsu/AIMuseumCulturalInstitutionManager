import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../api';
import VisitorFlowTimeline from '../customViews/VisitorFlowTimeline';
import ExhibitPopularityHeatmap from '../customViews/ExhibitPopularityHeatmap';
import CollectionReportPDF from '../customViews/CollectionReportPDF';
import AcquisitionLoanRulesEditor from '../customViews/AcquisitionLoanRulesEditor';

const VIEWS = [
  { key: 'visitor-flow', title: 'Visitor Flow Timeline', icon: '📈', Component: VisitorFlowTimeline },
  { key: 'exhibit-heatmap', title: 'Exhibit Popularity Heatmap', icon: '🔥', Component: ExhibitPopularityHeatmap },
  { key: 'collection-report', title: 'Collection Report PDF', icon: '📄', Component: CollectionReportPDF },
  { key: 'rules-editor', title: 'Acquisition / Loan Rules', icon: '⚖️', Component: AcquisitionLoanRulesEditor },
];

export default function CustomViewsPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState('visitor-flow');
  const activeView = VIEWS.find(v => v.key === active) || VIEWS[0];
  const ActiveComponent = activeView.Component;

  const s = {
    page: { minHeight: '100vh', background: '#1a1a2a', color: '#fff' },
    nav: { background: '#12121e', borderBottom: '1px solid #333', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    brand: { color: '#c9a84c', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' },
    layout: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, padding: 16 },
    sidebar: { background: '#1f1f2e', borderRadius: 12, padding: 12 },
    sideItem: (active) => ({
      padding: '10px 12px',
      borderRadius: 8,
      cursor: 'pointer',
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      background: active ? '#2c2c44' : 'transparent',
      color: active ? '#c9a84c' : '#ddd',
      marginBottom: 4,
      fontSize: 14,
      fontWeight: active ? 'bold' : 'normal',
    }),
    main: { background: '#161624', borderRadius: 12, padding: 18, minHeight: '70vh' },
    sectionTitle: { color: '#c9a84c', fontSize: 22, marginTop: 0 },
  };

  return (
    <div style={s.page} data-testid="custom-views-page">
      <nav style={s.nav}>
        <span style={s.brand} onClick={() => navigate('/')}>Museum Manager</span>
        <span style={{ color: '#aaa' }}>Museum Views</span>
        <button onClick={() => { clearToken(); navigate('/login'); }}
          style={{ padding: '8px 16px', background: '#555', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Logout
        </button>
      </nav>
      <div style={s.layout}>
        <aside style={s.sidebar} data-testid="custom-views-sidebar">
          <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px' }}>
            Museum Views
          </div>
          {VIEWS.map(v => (
            <div key={v.key}
              data-testid={`sidebar-${v.key}`}
              style={s.sideItem(active === v.key)}
              onClick={() => setActive(v.key)}>
              <span>{v.icon}</span><span>{v.title}</span>
            </div>
          ))}
        </aside>
        <main style={s.main}>
          <h1 style={s.sectionTitle}>{activeView.title}</h1>
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
