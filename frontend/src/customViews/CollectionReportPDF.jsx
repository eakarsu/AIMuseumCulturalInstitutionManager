import React, { useState } from 'react';

export default function CollectionReportPDF() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [lastUrl, setLastUrl] = useState('');

  const download = async () => {
    setDownloading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/custom-views/collection-report-pdf', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setLastUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'collection-report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      setError(e.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ background: '#252535', borderRadius: 12, padding: 20 }} data-testid="collection-report-pdf">
      <h3 style={{ color: '#c9a84c', marginTop: 0 }}>Collection Report (PDF)</h3>
      <p style={{ color: '#aaa', fontSize: 13 }}>
        Generate a downloadable PDF summary of all collections, total objects, and loan counts.
      </p>
      <button
        onClick={download}
        disabled={downloading}
        style={{
          padding: '10px 18px',
          background: downloading ? '#555' : '#c9a84c',
          color: '#1a1a2a',
          border: 'none',
          borderRadius: 8,
          fontWeight: 'bold',
          cursor: downloading ? 'not-allowed' : 'pointer',
        }}
      >
        {downloading ? 'Generating...' : 'Download Collection Report PDF'}
      </button>
      {lastUrl && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#38A169' }}>
          Last report ready. <a href={lastUrl} target="_blank" rel="noreferrer" style={{ color: '#c9a84c' }}>Open in new tab</a>
        </div>
      )}
      {error && <div style={{ marginTop: 12, color: '#E53E3E' }}>Error: {error}</div>}
    </div>
  );
}
