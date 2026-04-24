import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken } from '../api';

const AI_TOOLS = [
  { key: 'exhibition-description', title: 'Exhibition Description', icon: '🖼️', description: 'Generate exhibition wall text and descriptions' },
  { key: 'audio-tour', title: 'Audio Tour Script', icon: '🎧', description: 'Create engaging audio tour scripts' },
  { key: 'grant-narrative', title: 'Grant Narrative', icon: '📝', description: 'Write compelling grant narratives' },
  { key: 'research-summary', title: 'Research Summary', icon: '🔍', description: 'Generate collection research summaries' },
  { key: 'feedback-analysis', title: 'Feedback Analysis', icon: '📊', description: 'Analyze visitor feedback patterns' },
  { key: 'education-content', title: 'Education Content', icon: '📚', description: 'Generate educational program content' },
  { key: 'press-release', title: 'Press Release', icon: '📰', description: 'Draft professional press releases' },
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
      { key: 'feedbackData', label: 'Visitor Feedback', type: 'textarea', placeholder: 'Enter visitor feedback entries, one per line.\n\ne.g.:\nLoved the new Egyptian exhibit!\nWayfinding was confusing on the 2nd floor\nGreat docent tour, very informative\nCafeteria needs more options\nThe lighting in Gallery 3 was perfect' },
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
      { key: 'details', label: 'Key Details', type: 'textarea', placeholder: 'Provide the main details, facts, and context for the press release' },
      { key: 'quotes', label: 'Quotes', type: 'textarea', placeholder: 'Include any quotes from directors, curators, or stakeholders' },
    ]
  },
};

function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Bullet lists
  html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>\s*(<h[1-3]>)/g, '$1');
  html = html.replace(/(<\/h[1-3]>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<hr>)\s*<\/p>/g, '$1');

  return html;
}

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
      // Split feedbackData into array
      if (activeTool === 'feedback-analysis' && body.feedbackData) {
        body.feedbackData = body.feedbackData.split('\n').filter(line => line.trim());
      }
      const data = await api.post(`/ai/generate/${activeTool}`, body);
      setOutput(data);
    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (output?.content) {
      await navigator.clipboard.writeText(output.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="feature-page">
      <nav className="nav-bar">
        <div className="nav-brand" onClick={() => navigate('/')}>🏛️ Museum Manager</div>
        <div className="nav-title">🤖 AI Content Tools</div>
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
          <h1>🤖 AI Content Generation</h1>
        </div>
      </div>

      <div className="ai-layout">
        <div className="ai-sidebar">
          {AI_TOOLS.map(tool => (
            <div
              key={tool.key}
              className={`ai-sidebar-item ${activeTool === tool.key ? 'active' : ''}`}
              onClick={() => switchTool(tool.key)}
            >
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
                    <textarea
                      className="form-input"
                      value={formData[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={5}
                      required
                    />
                  ) : field.type === 'select' ? (
                    <select
                      className="form-input"
                      value={formData[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      required
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className="form-input"
                      value={formData[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required
                    />
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

          {error && (
            <div className="ai-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {output && (
            <div className="ai-output-container">
              <div className="ai-output-header">
                <h3>Generated Content</h3>
                <button className="btn btn-sm btn-gold" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <div className="ai-output" dangerouslySetInnerHTML={{ __html: renderMarkdown(output.content) }} />
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
