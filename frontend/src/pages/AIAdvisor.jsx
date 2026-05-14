import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken } from '../api';

const ADVISORS = [
  { key: 'visitor-experience-personalize', title: 'Visitor Experience', icon: '🎟️', description: 'Personalize a visit plan to interests, time and accessibility' },
  { key: 'collection-valuation', title: 'Collection Valuation', icon: '💎', description: 'Estimate market valuation range with confidence and risk flags' },
  { key: 'conservation-priority', title: 'Conservation Priority', icon: '🛠️', description: 'Rank objects by conservation urgency and recommended action' },
  { key: 'event-attendance-predict', title: 'Event Attendance Forecast', icon: '📈', description: 'Forecast attendance with drivers and risks' },
  { key: 'artifact-documentation', title: 'Artifact Documentation', icon: '📜', description: 'Generate structured catalog documentation from a description' },
  { key: 'teacher-resource-generator', title: 'Teacher Resource Pack', icon: '🎓', description: 'K-12 lesson plans tied to a topic or exhibition' },
  { key: 'donation-tax-doc', title: 'Donation Acknowledgment', icon: '🧾', description: 'Draft IRS-aligned donor acknowledgment language' },
];

const FORMS = {
  'visitor-experience-personalize': [
    { key: 'interests', label: 'Visitor Interests (comma separated)', type: 'text', placeholder: 'e.g., impressionism, ancient Egypt' },
    { key: 'age_group', label: 'Age Group', type: 'select', options: ['child', 'teen', 'adult', 'senior', 'family'] },
    { key: 'available_minutes', label: 'Available Time (minutes)', type: 'number', placeholder: '90' },
    { key: 'accessibility_needs', label: 'Accessibility Needs', type: 'text', placeholder: 'e.g., wheelchair, low vision' },
    { key: 'prior_visits', label: 'Prior Visits', type: 'number', placeholder: '0' },
  ],
  'collection-valuation': [
    { key: 'object_title', label: 'Object Title', type: 'text', placeholder: 'e.g., Water Lilies' },
    { key: 'artist', label: 'Artist', type: 'text', placeholder: 'e.g., Claude Monet' },
    { key: 'period', label: 'Period', type: 'text', placeholder: 'e.g., 1906' },
    { key: 'medium', label: 'Medium', type: 'text', placeholder: 'e.g., Oil on canvas' },
    { key: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'e.g., 200 x 425 cm' },
    { key: 'provenance', label: 'Provenance', type: 'textarea', placeholder: 'Ownership history' },
    { key: 'condition', label: 'Condition', type: 'select', options: ['unknown', 'excellent', 'good', 'fair', 'poor'] },
    { key: 'comparable_sales', label: 'Comparable Sales (one per line: title, price)', type: 'textarea', placeholder: 'e.g., Lily Pond, 12000000' },
  ],
  'conservation-priority': [
    { key: 'objects_text', label: 'Objects (JSON array, optional)', type: 'textarea', placeholder: '[{"id":1,"title":"Vase","condition":"poor"}]' },
  ],
  'event-attendance-predict': [
    { key: 'event_name', label: 'Event Name', type: 'text', placeholder: 'e.g., Summer Solstice Gala' },
    { key: 'event_type', label: 'Event Type', type: 'text', placeholder: 'e.g., gala, lecture, family day' },
    { key: 'event_date', label: 'Event Date', type: 'text', placeholder: 'YYYY-MM-DD' },
    { key: 'day_of_week', label: 'Day of Week', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    { key: 'capacity', label: 'Capacity', type: 'number', placeholder: '500' },
    { key: 'ticket_price_usd', label: 'Ticket Price (USD)', type: 'number', placeholder: '25' },
    { key: 'member_count', label: 'Member Count', type: 'number', placeholder: '5000' },
    { key: 'marketing_channels', label: 'Marketing Channels (comma separated)', type: 'text', placeholder: 'email, social, partner orgs' },
    { key: 'historical_attendance', label: 'Historical Attendance (one per line: name, count)', type: 'textarea', placeholder: 'Spring Gala 2024, 412' },
    { key: 'weather_forecast', label: 'Weather Forecast', type: 'text', placeholder: 'e.g., clear, 78F' },
  ],
  'artifact-documentation': [
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Physical description and any notes...' },
    { key: 'materials', label: 'Materials', type: 'text', placeholder: 'e.g., bronze, terracotta' },
    { key: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'e.g., 24 x 14 cm' },
    { key: 'accession_number', label: 'Accession Number', type: 'text', placeholder: 'e.g., 1989.42.1' },
    { key: 'period', label: 'Period', type: 'text', placeholder: 'e.g., Late Bronze Age' },
    { key: 'provenance_notes', label: 'Provenance Notes', type: 'textarea', placeholder: 'Ownership history' },
  ],
  'teacher-resource-generator': [
    { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Ancient Egyptian funerary practices' },
    { key: 'grade_band', label: 'Grade Band', type: 'select', options: ['K-2', '3-5', '6-8', '9-12'] },
    { key: 'duration_minutes', label: 'Class Duration (min)', type: 'number', placeholder: '45' },
    { key: 'exhibition', label: 'Tied Exhibition (optional)', type: 'text', placeholder: '' },
    { key: 'standards_framework', label: 'Standards Framework', type: 'text', placeholder: 'e.g., Common Core, NGSS' },
  ],
  'donation-tax-doc': [
    { key: 'donor_name', label: 'Donor Name', type: 'text', placeholder: 'e.g., Jane Doe' },
    { key: 'donation_type', label: 'Donation Type', type: 'select', options: ['cash', 'in-kind', 'securities', 'other'] },
    { key: 'amount_or_value', label: 'Amount or FMV', type: 'text', placeholder: 'e.g., $5,000' },
    { key: 'item_description', label: 'Item Description (in-kind)', type: 'textarea', placeholder: 'Describe the item' },
    { key: 'donation_date', label: 'Donation Date', type: 'text', placeholder: 'YYYY-MM-DD' },
    { key: 'institution_name', label: 'Institution Name', type: 'text', placeholder: 'e.g., Riverside Museum of Art' },
    { key: 'ein', label: 'EIN', type: 'text', placeholder: 'XX-XXXXXXX' },
  ],
};

const rs = {
  card: { background: '#2a2a3e', borderRadius: 10, padding: 16, marginBottom: 14 },
  label: { color: '#c9a84c', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  badge: (color) => ({ display: 'inline-block', background: color + '22', color, padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 'bold' }),
};

function FieldBlock({ label, value, highlight }) {
  return (
    <div style={rs.card}>
      <div style={rs.label}>{label}</div>
      <div style={{ color: highlight ? '#fff' : '#ddd', fontSize: highlight ? 18 : 14, fontWeight: highlight ? 'bold' : 'normal', lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}
function ListBlock({ label, items, color, bullet }) {
  return (
    <div style={rs.card}>
      <div style={rs.label}>{label}</div>
      {items.map((item, i) => (
        <div key={i} style={{ color: '#ddd', fontSize: 14, padding: '4px 0', borderBottom: '1px solid #333', lineHeight: 1.5 }}>
          <span style={{ color, marginRight: 8 }}>{bullet}</span>{typeof item === 'string' ? item : JSON.stringify(item)}
        </div>
      ))}
    </div>
  );
}

function VisitorResult({ data }) {
  if (data.raw_output) return <pre style={{ color: '#ccc', whiteSpace: 'pre-wrap' }}>{data.raw_output}</pre>;
  return (
    <div>
      {data.headline && <FieldBlock label="Headline" value={data.headline} highlight />}
      {data.recommended_galleries?.length > 0 && <ListBlock label="Recommended Galleries" items={data.recommended_galleries} color="#c9a84c" bullet="*" />}
      {data.must_see_objects?.length > 0 && <ListBlock label="Must-See Objects" items={data.must_see_objects} color="#38A169" bullet="+" />}
      {data.suggested_route?.length > 0 && <ListBlock label="Suggested Route" items={data.suggested_route} color="#888" bullet="→" />}
      {data.time_allocations_minutes && (
        <div style={rs.card}>
          <div style={rs.label}>Time Allocations (minutes)</div>
          {Object.entries(data.time_allocations_minutes).map(([k, v]) => (
            <div key={k} style={{ color: '#ddd', padding: '4px 0', borderBottom: '1px solid #333' }}>
              <span style={{ color: '#c9a84c' }}>{k}</span>: <strong>{v}</strong>
            </div>
          ))}
        </div>
      )}
      {data.accessibility_tips?.length > 0 && <ListBlock label="Accessibility Tips" items={data.accessibility_tips} color="#3498db" bullet="·" />}
      {data.engagement_tips?.length > 0 && <ListBlock label="Engagement Tips" items={data.engagement_tips} color="#D69E2E" bullet="·" />}
    </div>
  );
}

function ValuationResult({ data }) {
  if (data.raw_output) return <pre style={{ color: '#ccc', whiteSpace: 'pre-wrap' }}>{data.raw_output}</pre>;
  return (
    <div>
      {(data.estimated_value_low_usd != null || data.estimated_value_high_usd != null) && (
        <div style={rs.card}>
          <div style={rs.label}>Estimated Value Range (USD)</div>
          <div style={{ fontSize: 22, color: '#fff', fontWeight: 'bold' }}>
            ${Number(data.estimated_value_low_usd || 0).toLocaleString()} – ${Number(data.estimated_value_high_usd || 0).toLocaleString()}
          </div>
        </div>
      )}
      {data.confidence && (
        <div style={rs.card}>
          <div style={rs.label}>Confidence</div>
          <span style={rs.badge(data.confidence === 'high' ? '#38A169' : data.confidence === 'medium' ? '#D69E2E' : '#E53E3E')}>{data.confidence.toUpperCase()}</span>
        </div>
      )}
      {data.valuation_method && <FieldBlock label="Valuation Method" value={data.valuation_method} />}
      {data.key_factors?.length > 0 && <ListBlock label="Key Factors" items={data.key_factors} color="#c9a84c" bullet="·" />}
      {data.risk_flags?.length > 0 && <ListBlock label="Risk Flags" items={data.risk_flags} color="#E53E3E" bullet="!" />}
      {data.insurance_recommendation && <FieldBlock label="Insurance Recommendation" value={data.insurance_recommendation} />}
    </div>
  );
}

function PriorityResult({ data }) {
  if (data.raw_output) return <pre style={{ color: '#ccc', whiteSpace: 'pre-wrap' }}>{data.raw_output}</pre>;
  const priorityColor = { urgent: '#E53E3E', high: '#D69E2E', medium: '#c9a84c', low: '#888' };
  return (
    <div>
      {data.ranked?.length > 0 && (
        <div style={rs.card}>
          <div style={rs.label}>Ranked Objects ({data.ranked.length})</div>
          {data.ranked.map((r, i) => (
            <div key={i} style={{ background: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={rs.badge(priorityColor[r.priority] || '#888')}>{(r.priority || '').toUpperCase()}</span>
                <span style={{ color: '#fff', marginLeft: 10, fontWeight: 'bold' }}>#{r.id}</span>
                {r.estimated_hours != null && <span style={{ color: '#888', marginLeft: 10, fontSize: 13 }}>~{r.estimated_hours}h</span>}
              </div>
              {r.reason && <div style={{ color: '#aaa', fontSize: 13, marginBottom: 4 }}>{r.reason}</div>}
              {r.recommended_action && <div style={{ color: '#ddd', fontSize: 13 }}>Action: {r.recommended_action}</div>}
            </div>
          ))}
        </div>
      )}
      {data.overall_recommendations?.length > 0 && <ListBlock label="Overall Recommendations" items={data.overall_recommendations} color="#c9a84c" bullet="→" />}
    </div>
  );
}

function AttendanceResult({ data }) {
  if (data.raw_output) return <pre style={{ color: '#ccc', whiteSpace: 'pre-wrap' }}>{data.raw_output}</pre>;
  const conf = (data.confidence || '').toLowerCase();
  return (
    <div>
      {data.predicted_attendance != null && (
        <div style={rs.card}>
          <div style={rs.label}>Predicted Attendance</div>
          <div style={{ fontSize: 22, color: '#fff', fontWeight: 'bold' }}>
            {Number(data.predicted_attendance).toLocaleString()}
            {(data.predicted_attendance_low != null && data.predicted_attendance_high != null) && (
              <span style={{ color: '#888', fontSize: 14, marginLeft: 12, fontWeight: 'normal' }}>
                (range {Number(data.predicted_attendance_low).toLocaleString()}–{Number(data.predicted_attendance_high).toLocaleString()})
              </span>
            )}
          </div>
        </div>
      )}
      {data.fill_rate_percent != null && <FieldBlock label="Fill Rate" value={`${data.fill_rate_percent}%`} highlight />}
      {data.confidence && (
        <div style={rs.card}>
          <div style={rs.label}>Confidence</div>
          <span style={rs.badge(conf === 'high' ? '#38A169' : conf === 'medium' ? '#D69E2E' : '#E53E3E')}>{(data.confidence || '').toUpperCase()}</span>
        </div>
      )}
      {data.key_drivers?.length > 0 && <ListBlock label="Key Drivers" items={data.key_drivers} color="#c9a84c" bullet="·" />}
      {data.risk_factors?.length > 0 && <ListBlock label="Risk Factors" items={data.risk_factors} color="#E53E3E" bullet="!" />}
      {data.recommendations?.length > 0 && <ListBlock label="Recommendations" items={data.recommendations} color="#38A169" bullet="→" />}
    </div>
  );
}

export default function AIAdvisor() {
  const navigate = useNavigate();
  const [active, setActive] = useState('visitor-experience-personalize');
  const [formData, setFormData] = useState({});
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tool = ADVISORS.find(t => t.key === active);
  const fields = FORMS[active];

  function handle(key, val) { setFormData(p => ({ ...p, [key]: val })); }

  function switchTool(key) {
    setActive(key);
    setFormData({});
    setOutput(null);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(''); setOutput(null);
    try {
      let body = { ...formData };
      if (active === 'visitor-experience-personalize') {
        body.interests = (body.interests || '').split(',').map(s => s.trim()).filter(Boolean);
        if (body.available_minutes) body.available_minutes = parseInt(body.available_minutes);
        if (body.prior_visits) body.prior_visits = parseInt(body.prior_visits);
      } else if (active === 'collection-valuation') {
        if (body.comparable_sales) {
          body.comparable_sales = body.comparable_sales.split('\n').map(line => {
            const parts = line.split(',').map(s => s.trim());
            return { title: parts[0] || '', price: parts[1] || '' };
          }).filter(s => s.title);
        }
      } else if (active === 'conservation-priority') {
        if (body.objects_text) {
          try { body.objects = JSON.parse(body.objects_text); } catch { /* let backend default */ }
        }
        delete body.objects_text;
      } else if (active === 'teacher-resource-generator') {
        if (body.duration_minutes) body.duration_minutes = parseInt(body.duration_minutes);
      } else if (active === 'event-attendance-predict') {
        body.marketing_channels = (body.marketing_channels || '').split(',').map(s => s.trim()).filter(Boolean);
        if (body.capacity) body.capacity = parseInt(body.capacity);
        if (body.ticket_price_usd) body.ticket_price_usd = parseFloat(body.ticket_price_usd);
        if (body.member_count) body.member_count = parseInt(body.member_count);
        if (body.historical_attendance) {
          body.historical_attendance = body.historical_attendance.split('\n').map(line => {
            const parts = line.split(',').map(s => s.trim());
            return { name: parts[0] || '', count: parseInt(parts[1]) || 0 };
          }).filter(s => s.name);
        }
      }

      // Backend mounts router at /api/ai and routes themselves are /ai/<name>
      const data = await api.post(`/ai/ai/${active}`, body);
      setOutput(data);
    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  }

  function renderOutput() {
    if (!output) return null;
    if (active === 'visitor-experience-personalize') return <VisitorResult data={output} />;
    if (active === 'collection-valuation') return <ValuationResult data={output} />;
    if (active === 'conservation-priority') return <PriorityResult data={output} />;
    if (active === 'event-attendance-predict') return <AttendanceResult data={output} />;
    return <pre style={{ color: '#ccc', whiteSpace: 'pre-wrap' }}>{JSON.stringify(output, null, 2)}</pre>;
  }

  return (
    <div className="feature-page">
      <nav className="nav-bar">
        <div className="nav-brand" onClick={() => navigate('/')}>Museum Manager</div>
        <div className="nav-title">AI Advisor</div>
        <div className="nav-actions">
          <button className="btn btn-sm" onClick={() => { clearToken(); navigate('/login'); }}>Logout</button>
        </div>
      </nav>

      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--gold)' }}>Dashboard</span>
            <span> / AI Advisor</span>
          </div>
          <h1>AI Advisor</h1>
        </div>
      </div>

      <div className="ai-layout">
        <div className="ai-sidebar">
          {ADVISORS.map(t => (
            <div key={t.key} className={`ai-sidebar-item ${active === t.key ? 'active' : ''}`} onClick={() => switchTool(t.key)}>
              <span className="ai-sidebar-icon">{t.icon}</span>
              <div>
                <div className="ai-sidebar-title">{t.title}</div>
                <div className="ai-sidebar-desc">{t.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="ai-main">
          <div className="ai-panel">
            <div className="ai-panel-header">
              <span className="ai-panel-icon">{tool.icon}</span>
              <div>
                <h2>{tool.title}</h2>
                <p>{tool.description}</p>
              </div>
            </div>

            <form className="ai-form" onSubmit={handleSubmit}>
              {fields.map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea className="form-input" value={formData[f.key] || ''} onChange={e => handle(f.key, e.target.value)} placeholder={f.placeholder} rows={4} />
                  ) : f.type === 'select' ? (
                    <select className="form-input" value={formData[f.key] || ''} onChange={e => handle(f.key, e.target.value)}>
                      <option value="">Select…</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} className="form-input" value={formData[f.key] || ''} onChange={e => handle(f.key, e.target.value)} placeholder={f.placeholder} />
                  )}
                </div>
              ))}
              <button type="submit" className="btn btn-gold btn-lg" disabled={loading}>
                {loading ? 'Generating...' : `Run ${tool.title}`}
              </button>
            </form>
          </div>

          {loading && (
            <div className="ai-loading-container">
              <div className="ai-loading"></div>
              <p>AI is analyzing...</p>
            </div>
          )}
          {error && <div className="ai-error"><strong>Error:</strong> {error}</div>}
          {output && (
            <div className="ai-output-container">
              <div className="ai-output-header"><h3>Result</h3></div>
              {renderOutput()}
              {output.model && <div className="ai-output-meta"><span>Model: {output.model}</span></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
