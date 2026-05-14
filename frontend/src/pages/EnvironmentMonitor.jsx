import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken } from '../api';

const riskColors = {
  low: '#38A169',
  medium: '#D69E2E',
  high: '#DD6B20',
  critical: '#E53E3E',
};

export default function EnvironmentMonitor() {
  const navigate = useNavigate();
  const [riskData, setRiskData] = useState(null);
  const [alertResult, setAlertResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRisk = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/ai/conservation-risk');
      setRiskData(data);
    } catch (err) {
      setError(err.message || 'Failed to load conservation risk data');
    } finally {
      setLoading(false);
    }
  };

  const checkAlerts = async () => {
    setAlertLoading(true);
    setError('');
    try {
      const data = await api.post('/environment/check-alerts', {});
      setAlertResult(data);
    } catch (err) {
      setError(err.message || 'Failed to check alerts');
    } finally {
      setAlertLoading(false);
    }
  };

  useEffect(() => { loadRisk(); }, []);

  const s = {
    page: { minHeight: '100vh', background: '#1a1a2a', color: '#fff' },
    nav: { background: '#12121e', borderBottom: '1px solid #333', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    brand: { color: '#c9a84c', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' },
    content: { padding: 32, maxWidth: 1100, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#c9a84c' },
    btn: (bg) => ({ padding: '10px 22px', background: bg, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }),
    card: { background: '#252535', borderRadius: 12, padding: 20, marginBottom: 16 },
    galleryCard: (risk) => ({
      background: '#252535', borderRadius: 12, padding: 20, marginBottom: 16,
      borderLeft: `5px solid ${riskColors[risk] || '#888'}`,
    }),
    riskBadge: (risk) => ({
      display: 'inline-block', background: (riskColors[risk] || '#888') + '22',
      color: riskColors[risk] || '#888', padding: '4px 14px', borderRadius: 20,
      fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1,
    }),
    label: { color: '#c9a84c', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    value: { color: '#ddd', fontSize: 14, lineHeight: 1.6 },
    alertBox: { background: '#1a2a1a', border: '1px solid #38A169', borderRadius: 12, padding: 20, marginTop: 24 },
    alertBadge: { display: 'inline-block', background: '#E53E3E22', color: '#E53E3E', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', marginRight: 8 },
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.brand} onClick={() => navigate('/')}>Museum Manager</span>
        <span style={{ color: '#aaa', fontSize: 16 }}>Environment Monitor</span>
        <button style={s.btn('#555')} onClick={() => { clearToken(); navigate('/login'); }}>Logout</button>
      </nav>

      <div style={s.content}>
        <div style={s.header}>
          <h1 style={s.title}>Environmental Monitoring & Conservation Risk</h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={s.btn('#c9a84c')} onClick={loadRisk} disabled={loading}>
              {loading ? 'Analyzing...' : 'Refresh Risk Analysis'}
            </button>
            <button style={s.btn('#E53E3E')} onClick={checkAlerts} disabled={alertLoading}>
              {alertLoading ? 'Checking...' : 'Check & Create Alerts'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#2a1a1a', border: '1px solid #E53E3E', borderRadius: 8, padding: 16, marginBottom: 20, color: '#E53E3E' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#c9a84c' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>AI analyzing environmental data...</div>
          </div>
        )}

        {riskData && !loading && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              {['low', 'medium', 'high', 'critical'].map(level => {
                const count = (riskData.galleries || []).filter(g => g.risk_level === level).length;
                return (
                  <div key={level} style={{ ...s.card, minWidth: 140, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: riskColors[level] }}>{count}</div>
                    <div style={{ ...s.riskBadge(level), marginTop: 8, display: 'block' }}>{level}</div>
                  </div>
                );
              })}
              <div style={{ ...s.card, minWidth: 140, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#c9a84c' }}>{riskData.readings_analyzed || 0}</div>
                <div style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>Readings Analyzed</div>
              </div>
            </div>

            {riskData.galleries?.length > 0 && (
              <div>
                <h3 style={{ color: '#c9a84c', marginBottom: 16 }}>Gallery Risk Breakdown</h3>
                {riskData.galleries.map((gallery, i) => (
                  <div key={i} style={s.galleryCard(gallery.risk_level)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ color: '#fff', margin: 0 }}>Gallery {gallery.gallery_id}</h4>
                      <span style={s.riskBadge(gallery.risk_level)}>{gallery.risk_level} risk</span>
                    </div>
                    {gallery.temp_concerns && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={s.label}>Temperature Concerns</div>
                        <div style={s.value}>{gallery.temp_concerns}</div>
                      </div>
                    )}
                    {gallery.humidity_concerns && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={s.label}>Humidity Concerns</div>
                        <div style={s.value}>{gallery.humidity_concerns}</div>
                      </div>
                    )}
                    {gallery.at_risk_objects?.length > 0 && (
                      <div>
                        <div style={s.label}>At-Risk Objects</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {gallery.at_risk_objects.map((obj, j) => (
                            <span key={j} style={{ background: '#E53E3E22', color: '#E53E3E', padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>{obj}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {riskData.recommendations?.length > 0 && (
              <div style={s.card}>
                <div style={s.label}>AI Recommendations</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {riskData.recommendations.map((rec, i) => (
                    <li key={i} style={{ color: '#ddd', fontSize: 14, padding: '6px 0', borderBottom: '1px solid #333', lineHeight: 1.5 }}>
                      {i + 1}. {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {riskData.raw_output && (
              <div style={s.card}>
                <div style={s.label}>AI Analysis</div>
                <pre style={{ color: '#ccc', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{riskData.raw_output}</pre>
              </div>
            )}
          </div>
        )}

        {alertResult && (
          <div style={s.alertBox}>
            <h3 style={{ color: '#38A169', margin: '0 0 16px 0' }}>
              Alert Check Complete — {alertResult.alerts_created} alert(s) created
            </h3>
            {alertResult.out_of_range_readings?.length > 0 ? (
              <div>
                {alertResult.out_of_range_readings.map((reading, i) => (
                  <div key={i} style={{ marginBottom: 12, padding: 12, background: '#1a1a1a', borderRadius: 8 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <span style={s.alertBadge}>Gallery {reading.gallery_id}</span>
                      <span style={{ color: '#888', fontSize: 12 }}>{new Date(reading.recorded_at).toLocaleString()}</span>
                    </div>
                    {reading.issues.map((issue, j) => (
                      <div key={j} style={{ color: '#E53E3E', fontSize: 13 }}>• {issue}</div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#38A169', fontSize: 14 }}>All recent readings are within safe ranges.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
