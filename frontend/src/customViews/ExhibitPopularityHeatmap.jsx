import React, { useEffect, useState } from 'react';
import { api } from '../api';

function intensityColor(v, max) {
  const t = max ? v / max : 0;
  // Interpolate from dark navy to gold
  const r = Math.round(40 + t * (201 - 40));
  const g = Math.round(40 + t * (168 - 40));
  const b = Math.round(60 + t * (76 - 60));
  return `rgb(${r},${g},${b})`;
}

export default function ExhibitPopularityHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/custom-views/exhibit-popularity-heatmap');
      setData(r);
    } catch (e) {
      setError(e.message || 'Failed to load heatmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ color: '#aaa' }}>Loading heatmap...</div>;
  if (error) return <div style={{ color: '#E53E3E' }}>Error: {error}</div>;
  if (!data) return null;

  return (
    <div style={{ background: '#252535', borderRadius: 12, padding: 20 }} data-testid="exhibit-popularity-heatmap">
      <h3 style={{ color: '#c9a84c', marginTop: 0 }}>Exhibit Popularity Heatmap</h3>
      <p style={{ color: '#888', fontSize: 12, marginTop: 0 }}>Visitors per exhibit x time-of-day bucket. Max = {data.max_visitors}</p>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', color: '#aaa', fontWeight: 'normal', fontSize: 12, padding: 4 }}>Exhibit</th>
            {data.time_buckets.map(b => (
              <th key={b} style={{ color: '#aaa', fontWeight: 'normal', fontSize: 12, padding: 4 }}>{b}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.exhibitions.map(exh => (
            <tr key={exh.id}>
              <td style={{ color: '#ddd', fontSize: 13, padding: 6, whiteSpace: 'nowrap' }}>{exh.title}</td>
              {data.time_buckets.map(bucket => {
                const cell = data.cells.find(c => c.exhibition_id === exh.id && c.time_bucket === bucket);
                const v = cell?.visitors || 0;
                return (
                  <td key={bucket}
                    title={`${exh.title} @ ${bucket}: ${v} visitors`}
                    style={{
                      textAlign: 'center',
                      padding: '12px 6px',
                      background: intensityColor(v, data.max_visitors),
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 'bold',
                      minWidth: 50,
                    }}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
