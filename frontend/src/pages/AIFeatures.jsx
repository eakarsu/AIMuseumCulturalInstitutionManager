import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken } from '../api';

const AI_TOOLS = [
  { key: 'exhibition-description', title: 'Exhibition Description', icon: '🖼️', description: 'Generate structured exhibition wall text and descriptions' },
  { key: 'audio-tour', title: 'Audio Tour Script', icon: '🎧', description: 'Create engaging audio tour scripts' },
  { key: 'grant-narrative', title: 'Grant Narrative', icon: '📝', description: 'Write compelling grant narratives as structured sections' },
  { key: 'research-summary', title: 'Research Summary', icon: '🔍', description: 'Generate collection research summaries' },
  { key: 'feedback-analysis', title: 'Feedback Analysis', icon: '📊', description: 'Analyze visitor feedback with sentiment scores' },
  { key: 'education-content', title: 'Education Content', icon: '📚', description: 'Generate educational program content' },
  { key: 'press-release', title: 'Press Release', icon: '📰', description: 'Draft professional press releases' },
  { key: 'build-exhibition', title: 'AI Build Exhibition', icon: '🏗️', description: 'AI Curator builds a complete exhibition from theme' },
];

const TOOL_FORMS = {
  'exhibition-description': {
    fields: [
      { key: 'title', label: 'Exhibition Title', type: 'text', placeholder: 'e.g., Impressionism: Light & Color' },
      { key: 'theme', label: 'Theme', type: 'text', placeholder: 'e.g., French Impressionist movement 1860-1890' },
      { key: 'objects', label: 'Key Objects/Artworks', type: 'textarea', placeholder: 'List the main objects in the exhibition, one per line' },
      { key: 'period', label: 'Time Period', type: 'text', placeholder: 'e.g., Late 19th Century' },
    ]
  },
  'audio-tour': {
    fields: [
      { key: 'exhibition', label: 'Exhibition Name', type: 'text', placeholder: 'e.g., Ancient Egypt: Eternal Life' },
      { key: 'stops', label: 'Tour Stops/Objects', type: 'textarea', placeholder: 'List each stop with a brief description, one per line' },
      { key: 'duration', label: 'Total Duration', type: 'text', placeholder: 'e.g., 45 minutes' },
      { key: 'audience', label: 'Target Audience', type: 'select', options: ['general', 'children', 'expert', 'accessibility'] },
    ]
  },
  'grant-narrative': {
    fields: [
      { key: 'grantName', label: 'Grant Name', type: 'text', placeholder: 'e.g., NEA Art Works Grant' },
      { key: 'amount', label: 'Requested Amount', type: 'text', placeholder: 'e.g., $50,000' },
      { key: 'purpose', label: 'Purpose/Project Description', type: 'textarea', placeholder: 'Describe the project this grant would fund' },
      { key: 'institution', label: 'Institution Name', type: 'text', placeholder: 'e.g., Metropolitan Museum of Art' },
    ]
  },
  'research-summary': {
    fields: [
      { key: 'objectTitle', label: 'Object/Artwork Title', type: 'text', placeholder: 'e.g., Water Lilies' },
      { key: 'artist', label: 'Artist/Creator', type: 'text', placeholder: 'e.g., Claude Monet' },
      { key: 'period', label: 'Period', type: 'text', placeholder: 'e.g., 1906, French Impressionism' },
      { key: 'medium', label: 'Medium', type: 'text', placeholder: 'e.g., Oil on canvas' },
    ]
  },
  'feedback-analysis': {
    fields: [
      { key: 'feedbackData', label: 'Visitor Feedback', type: 'textarea', placeholder: 'Enter visitor feedback entries, one per line.\n\ne.g.:\nLoved the new Egyptian exhibit!\nWayfinding was confusing on the 2nd floor\nGreat docent tour, very informative' },
    ]
  },
  'education-content': {
    fields: [
      { key: 'programName', label: 'Program Name', type: 'text', placeholder: 'e.g., Art Explorers Summer Camp' },
      { key: 'ageGroup', label: 'Age Group', type: 'select', options: ['children 5-8', 'children 9-12', 'teens', 'adults', 'seniors', 'families'] },
      { key: 'topic', label: 'Topic/Theme', type: 'text', placeholder: 'e.g., Renaissance Art Techniques' },
      { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 2 hours, 5-day camp' },
    ]
  },
  'press-release': {
    fields: [
      { key: 'title', label: 'Headline/Event Title', type: 'text', placeholder: 'e.g., Museum Acquires Rare Van Gogh Painting' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'details', label: 'Key Details', type: 'textarea', placeholder: 'Provide the main details, facts, and context' },
      { key: 'quotes', label: 'Quotes', type: 'textarea', placeholder: 'Include any quotes from directors, curators, or stakeholders' },
    ]
  },
  'build-exhibition': {
    fields: [
      { key: 'theme', label: 'Exhibition Theme', type: 'text', placeholder: 'e.g., Ancient Egyptian Artifacts, Impressionist Landscapes' },
      { key: 'budget', label: 'Budget', type: 'text', placeholder: 'e.g., $50,000' },
      { key: 'gallery_id', label: 'Gallery ID (optional)', type: 'text', placeholder: 'e.g., 3' },
    ]
  },
};

// Structured result renderers for JSON-returning endpoints
function ExhibitionDescriptionResult({ data }) {
  if (data.raw_output) return <RawText text={data.raw_output} />;
  return (
    <div>
      {data.title && <FieldBlock label="Title" value={data.title} highlight />}
      {data.thematic_overview && <FieldBlock label="Thematic Overview" value={data.thematic_overview} />}
      {data.wall_text && <FieldBlock label="Wall Text" value={data.wall_text} />}
      {data.key_themes?.length > 0 && <TagBlock label="Key Themes" tags={data.key_themes} />}
      {data.visitor_engagement_notes && <FieldBlock label="Visitor Engagement" value={data.visitor_engagement_notes} />}
      {data.accessibility_notes && <FieldBlock label="Accessibility Notes" value={data.accessibility_notes} />}
    </div>
  );
}

function GrantNarrativeResult({ data }) {
  if (data.raw_output) return <RawText text={data.raw_output} />;
  const sections = ['executive_summary', 'project_description', 'budget_justification', 'community_impact', 'evaluation_plan', 'sustainability'];
  return (
    <div>
      {sections.map(key => data[key] && <FieldBlock key={key} label={key.replace(/_/g, ' ')} value={data[key]} />)}
    </div>
  );
}

function FeedbackAnalysisResult({ data }) {
  if (data.raw_output) return <RawText text={data.raw_output} />;
  const sentimentColor = { positive: '#38A169', neutral: '#D69E2E', negative: '#E53E3E' };
  const score = data.satisfaction_score || 0;
  return (
    <div>
      {data.overall_sentiment && (
        <div style={rs.card}>
          <div style={rs.label}>Overall Sentiment</div>
          <span style={{ ...rs.badge(sentimentColor[data.overall_sentiment] || '#888'), fontSize: 16 }}>
            {data.overall_sentiment?.toUpperCase()}
          </span>
        </div>
      )}
      {data.satisfaction_score !== undefined && (
        <div style={rs.card}>
          <div style={rs.label}>Satisfaction Score: {score}/100</div>
          <div style={{ height: 12, background: '#1a1a1a', borderRadius: 6, overflow: 'hidden', marginTop: 8 }}>
            <div style={{ height: '100%', borderRadius: 6, width: `${score}%`, background: score >= 70 ? '#38A169' : score >= 40 ? '#D69E2E' : '#E53E3E' }} />
          </div>
        </div>
      )}
      {data.top_praise?.length > 0 && <ListBlock label="Top Praise" items={data.top_praise} color="#38A169" bullet="+" />}
      {data.top_complaints?.length > 0 && <ListBlock label="Top Complaints" items={data.top_complaints} color="#E53E3E" bullet="-" />}
      {data.recommendations?.length > 0 && <ListBlock label="Recommendations" items={data.recommendations} color="#c9a84c" bullet="→" />}
    </div>
  );
}

function BuildExhibitionResult({ data }) {
  if (data.raw_output) return <RawText text={data.raw_output} />;
  return (
    <div>
      {data.exhibition_title && <FieldBlock label="Exhibition Title" value={data.exhibition_title} highlight />}
      {data.estimated_visitor_count && (
        <div style={rs.card}>
          <div style={rs.label}>Estimated Visitors</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#c9a84c' }}>{Number(data.estimated_visitor_count).toLocaleString()}</div>
        </div>
      )}
      {data.selected_objects?.length > 0 && (
        <div style={rs.card}>
          <div style={rs.label}>Selected Objects ({data.selected_objects.length})</div>
          {data.selected_objects.map((obj, i) => (
            <div key={i} style={{ background: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: 4 }}>{obj.title}</div>
              <div style={{ color: '#aaa', fontSize: 13 }}>{obj.rationale}</div>
            </div>
          ))}
        </div>
      )}
      {data.layout_description && <FieldBlock label="Layout Description" value={data.layout_description} />}
      {data.wall_text_preview && <FieldBlock label="Wall Text Preview" value={data.wall_text_preview} />}
      {data.required_conservation_checks?.length > 0 && <ListBlock label="Required Conservation Checks" items={data.required_conservation_checks} color="#D69E2E" bullet="!" />}
      {data.created_exhibition && (
        <div style={{ ...rs.card, borderColor: '#38A169', borderWidth: 2, borderStyle: 'solid' }}>
          <div style={{ ...rs.label, color: '#38A169' }}>Exhibition Created in Database</div>
          <div style={{ color: '#fff' }}>ID: {data.created_exhibition.id} — {data.created_exhibition.title}</div>
        </div>
      )}
    </div>
  );
}

// Shared sub-components
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
function TagBlock({ label, tags }) {
  return (
    <div style={rs.card}>
      <div style={rs.label}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((t, i) => <span key={i} style={rs.badge('#c9a84c')}>{t}</span>)}
      </div>
    </div>
  );
}
function ListBlock({ label, items, color, bullet }) {
  return (
    <div style={rs.card}>
      <div style={rs.label}>{label}</div>
      {items.map((item, i) => (
        <div key={i} style={{ color: '#ddd', fontSize: 14, padding: '4px 0', borderBottom: '1px solid #333', lineHeight: 1.5 }}>
          <span style={{ color, marginRight: 8 }}>{bullet}</span>{item}
        </div>
      ))}
    </div>
  );
}
function RawText({ text }) {
  return <pre style={{ color: '#ccc', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6, background: '#1a1a1a', padding: 16, borderRadius: 8 }}>{text}</pre>;
}

function renderMarkdown(text) {
  if (!text) return '';
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^---+$/gm, '<hr>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>\s*(<h[1-3]>)/g, '$1');
  html = html.replace(/(<\/h[1-3]>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
  return html;
}

const STRUCTURED_TOOLS = new Set(['exhibition-description', 'grant-narrative', 'feedback-analysis', 'build-exhibition']);

export default function AIFeatures() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState('exhibition-description');
  const [formData, setFormData] = useState({});
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const currentTool = AI_TOOLS.find(t => t.key === activeTool);
  const currentForm = TOOL_FORMS[activeTool];

  function handleFieldChange(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  function switchTool(key) {
    setActiveTool(key);
    setFormData({});
    setOutput(null);
    setError('');
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput(null);
    setCopied(false);

    try {
      const body = { ...formData };
      if (activeTool === 'feedback-analysis' && body.feedbackData) {
        body.feedbackData = body.feedbackData.split('\n').filter(line => line.trim());
      }

      let endpoint;
      if (activeTool === 'build-exhibition') {
        endpoint = '/ai/build-exhibition';
      } else {
        endpoint = `/ai/generate/${activeTool}`;
      }

      const data = await api.post(endpoint, body);
      setOutput(data);
    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    const text = output?.content || JSON.stringify(output, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function renderStructuredOutput() {
    if (!output) return null;
    switch (activeTool) {
      case 'exhibition-description': return <ExhibitionDescriptionResult data={output} />;
      case 'grant-narrative': return <GrantNarrativeResult data={output} />;
      case 'feedback-analysis': return <FeedbackAnalysisResult data={output} />;
      case 'build-exhibition': return <BuildExhibitionResult data={output} />;
      default: return null;
    }
  }

  return (
    <div className="feature-page">
      <nav className="nav-bar">
        <div className="nav-brand" onClick={() => navigate('/')}>Museum Manager</div>
        <div className="nav-title">AI Content Tools</div>
        <div className="nav-actions">
          <button className="btn btn-sm" onClick={() => { clearToken(); navigate('/login'); }}>Logout</button>
        </div>
      </nav>

      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--gold)' }}>Dashboard</span>
            <span> / AI Tools</span>
          </div>
          <h1>AI Content Generation</h1>
        </div>
      </div>

      <div className="ai-layout">
        <div className="ai-sidebar">
          {AI_TOOLS.map(tool => (
            <div key={tool.key} className={`ai-sidebar-item ${activeTool === tool.key ? 'active' : ''}`} onClick={() => switchTool(tool.key)}>
              <span className="ai-sidebar-icon">{tool.icon}</span>
              <div>
                <div className="ai-sidebar-title">{tool.title}</div>
                <div className="ai-sidebar-desc">{tool.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="ai-main">
          <div className="ai-panel">
            <div className="ai-panel-header">
              <span className="ai-panel-icon">{currentTool.icon}</span>
              <div>
                <h2>{currentTool.title}</h2>
                <p>{currentTool.description}</p>
              </div>
            </div>

            <form className="ai-form" onSubmit={handleGenerate}>
              {currentForm.fields.map(field => (
                <div className="form-group" key={field.key}>
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea className="form-input" value={formData[field.key] || ''} onChange={e => handleFieldChange(field.key, e.target.value)} placeholder={field.placeholder} rows={5} required />
                  ) : field.type === 'select' ? (
                    <select className="form-input" value={formData[field.key] || ''} onChange={e => handleFieldChange(field.key, e.target.value)} required>
                      <option value="">Select {field.label}</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} className="form-input" value={formData[field.key] || ''} onChange={e => handleFieldChange(field.key, e.target.value)} placeholder={field.placeholder} required={field.required !== false} />
                  )}
                </div>
              ))}
              <button type="submit" className="btn btn-gold btn-lg" disabled={loading}>
                {loading ? 'Generating...' : `Generate ${currentTool.title}`}
              </button>
            </form>
          </div>

          {loading && (
            <div className="ai-loading-container">
              <div className="ai-loading"></div>
              <p>AI is generating your content...</p>
            </div>
          )}

          {error && <div className="ai-error"><strong>Error:</strong> {error}</div>}

          {output && (
            <div className="ai-output-container">
              <div className="ai-output-header">
                <h3>Generated Content</h3>
                <button className="btn btn-sm btn-gold" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>

              {STRUCTURED_TOOLS.has(activeTool) ? (
                renderStructuredOutput()
              ) : (
                <div className="ai-output" dangerouslySetInnerHTML={{ __html: renderMarkdown(output.content || JSON.stringify(output, null, 2)) }} />
              )}

              <div className="ai-output-meta">
                <span>Model: {output.model || 'N/A'}</span>
                {output.usage && (
                  <span>Tokens: {output.usage.prompt_tokens} prompt + {output.usage.completion_tokens} completion = {output.usage.total_tokens} total</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
