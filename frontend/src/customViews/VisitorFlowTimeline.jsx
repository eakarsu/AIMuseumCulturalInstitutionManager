import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function VisitorFlowTimeline() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/custom-views/visitor-flow-timeline');
      setData(r);
    } catch (e) {
      setError(e.message || 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ color: '#aaa' }}>Loading visitor timeline...</div>;
  if (error) return <div style={{ color: '#E53E3E' }}>Error: {error}</div>;
  if (!data) return null;

  const max = Math.max(1, ...data.timeline.map(d => Number(d.total_visitors)));

  return (
    <div style={{ background: '#252535', borderRadius: 12, padding: 20 }} data-testid="visitor-flow-timeline">
      <h3 style={{ color: '#c9a84c', marginTop: 0 }}>Visitor Flow Timeline (last {data.summary.days} days)</h3>
      <div style={{ display: 'flex', gap: 18, fontSize: 12, color: '#aaa', marginBottom: 12 }}>
        <span>Total: <b style={{ color: '#fff' }}>{data.summary.total_visitors.toLocaleString()}</b></span>
        <span>Avg/day: <b style={{ color: '#fff' }}>{data.summary.avg_per_day}</b></span>
        <span>Peak: <b style={{ color: '#fff' }}>{data.summary.peak_day || '-'}</b> ({data.summary.peak_visitors})</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 180, padding: '0 4px', background: '#1a1a2a', borderRadius: 8 }}>
        {data.timeline.map((row, i) => {
          const h = (Number(row.total_visitors) / max) * 160;
          return (
            <div key={i} title={`${row.date}: ${row.total_visitors}`}
              style={{
                flex: 1,
                minWidth: 4,
                height: h,
                background: 'linear-gradient(180deg,#c9a84c,#6b531e)',
                borderRadius: '4px 4px 0 0',
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#888' }}>
        <span>{data.timeline[0]?.date}</span>
        <span>{data.timeline[data.timeline.length - 1]?.date}</span>
      </div>
    </div>
  );
}
