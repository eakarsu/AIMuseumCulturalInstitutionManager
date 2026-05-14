import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken } from '../api';

export default function DonorInsights() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.post('/ai/donor-insights', {});
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load donor insights');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { minHeight: '100vh', background: '#1a1a2a', color: '#fff' },
    nav: { background: '#12121e', borderBottom: '1px solid #333', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    brand: { color: '#c9a84c', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' },
    content: { padding: 32, maxWidth: 1100, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#c9a84c' },
    btn: (bg) => ({ padding: '10px 22px', background: bg, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }),
    card: { background: '#252535', borderRadius: 12, padding: 20, marginBottom: 20 },
    sectionTitle: { color: '#c9a84c', fontSize: 16, fontWeight: 'bold', marginBottom: 16, borderBottom: '1px solid #333', paddingBottom: 8 },
    donorCard: { background: '#1a1a2e', borderRadius: 8, padding: 16, marginBottom: 10 },
    donorName: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
    metaRow: { display: 'flex', gap: 16, flexWrap: 'wrap' },
    meta: (color) => ({ color: color || '#aaa', fontSize: 13 }),
    churnCard: { background: '#2a1a1a', borderRadius: 8, padding: 16, marginBottom: 10, borderLeft: '4px solid #E53E3E' },
    grantCard: { background: '#1a2a1a', borderRadius: 8, padding: 16, marginBottom: 10, borderLeft: '4px solid #38A169' },
    badge: (color) => ({ display: 'inline-block', background: color + '22', color, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }),
    scoreBar: (pct) => ({
      height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden', marginTop: 6,
    }),
    scoreFill: (pct) => ({
      height: '100%', borderRadius: 4, width: `${Math.min(100, pct)}%`,
      background: pct >= 70 ? '#38A169' : pct >= 40 ? '#D69E2E' : '#E53E3E',
    }),
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.brand} onClick={() => navigate('/')}>Museum Manager</span>
        <span style={{ color: '#aaa', fontSize: 16 }}>Donor Intelligence</span>
        <button style={s.btn('#555')} onClick={() => { clearToken(); navigate('/login'); }}>Logout</button>
      </nav>

      <div style={s.content}>
        <div style={s.header}>
          <h1 style={s.title}>Donor Intelligence & Fundraising Insights</h1>
          <button style={s.btn('#c9a84c')} onClick={load} disabled={loading}>
            {loading ? 'Analyzing Donors...' : 'Generate AI Insights'}
          </button>
        </div>

        {error && (
          <div style={{ background: '#2a1a1a', border: '1px solid #E53E3E', borderRadius: 8, padding: 16, marginBottom: 20, color: '#E53E3E' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 80, color: '#c9a84c', fontSize: 18 }}>
            AI is analyzing your donor database...
          </div>
        )}

        {!data && !loading && (
          <div style={{ ...s.card, textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>AI Donor Analysis</div>
            <p style={{ color: '#aaa', fontSize: 16, marginBottom: 24 }}>
              AI will analyze your donor database to identify top contributors, churn risks, and grant opportunities.
            </p>
            <button style={s.btn('#c9a84c')} onClick={load}>Generate AI Insights</button>
          </div>
        )}

        {data && !loading && (
          <div>
            {data.donor_count !== undefined && (
              <div style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
                Analyzed {data.donor_count} donors | Model: {data.model || 'AI'}
              </div>
            )}

            {/* Top Donors */}
            {data.top_donors?.length > 0 && (
              <div style={s.card}>
                <div style={s.sectionTitle}>Top Donors</div>
                {data.top_donors.map((donor, i) => (
                  <div key={i} style={s.donorCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={s.donorName}>{donor.name}</div>
                      <span style={s.badge('#c9a84c')}>${Number(donor.total_donated || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>Engagement Score: {donor.engagement_score}/100</div>
                      <div style={s.scoreBar(donor.engagement_score)}>
                        <div style={s.scoreFill(donor.engagement_score)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Churn Risk Donors */}
            {data.churn_risk_donors?.length > 0 && (
              <div style={s.card}>
                <div style={s.sectionTitle}>At-Risk Donors (Churn Risk)</div>
                {data.churn_risk_donors.map((donor, i) => (
                  <div key={i} style={s.churnCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={s.donorName}>{donor.name}</div>
                      <span style={s.badge('#E53E3E')}>{donor.days_since_last_gift} days since gift</span>
                    </div>
                    {donor.recommended_action && (
                      <div>
                        <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>Recommended Action</div>
                        <div style={{ color: '#ddd', fontSize: 14 }}>{donor.recommended_action}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Grant Recommendations */}
            {data.grant_recommendations?.length > 0 && (
              <div style={s.card}>
                <div style={s.sectionTitle}>Grant Opportunities</div>
                {data.grant_recommendations.map((grant, i) => (
                  <div key={i} style={s.grantCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={s.donorName}>{grant.grant_name}</div>
                      {grant.deadline && <span style={s.badge('#38A169')}>Due: {grant.deadline}</span>}
                    </div>
                    <div style={{ color: '#ddd', fontSize: 14, lineHeight: 1.5 }}>{grant.match_reason}</div>
                  </div>
                ))}
              </div>
            )}

            {data.raw_output && (
              <div style={s.card}>
                <div style={{ color: '#c9a84c', fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>AI Analysis</div>
                <pre style={{ color: '#ccc', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{data.raw_output}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
