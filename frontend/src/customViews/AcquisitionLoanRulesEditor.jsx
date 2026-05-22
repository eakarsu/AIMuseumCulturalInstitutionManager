import React, { useEffect, useState } from 'react';
import { api } from '../api';

const EMPTY = { name: '', type: 'acquisition', condition: '', action: 'allow', priority: 1, enabled: true, notes: '' };

export default function AcquisitionLoanRulesEditor() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/custom-views/rules');
      setRules(r.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm(EMPTY); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/custom-views/rules/${editingId}`, form);
      } else {
        await api.post('/custom-views/rules', form);
      }
      resetForm();
      await load();
    } catch (e2) {
      setError(e2.message || 'Save failed');
    }
  };

  const edit = (rule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name || '',
      type: rule.type || 'acquisition',
      condition: rule.condition || '',
      action: rule.action || 'allow',
      priority: rule.priority || 1,
      enabled: rule.enabled !== false,
      notes: rule.notes || '',
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await api.delete(`/custom-views/rules/${id}`);
      await load();
    } catch (e) {
      setError(e.message || 'Delete failed');
    }
  };

  const inp = { padding: 8, background: '#1a1a2a', color: '#fff', border: '1px solid #333', borderRadius: 6, width: '100%' };

  return (
    <div style={{ background: '#252535', borderRadius: 12, padding: 20 }} data-testid="acquisition-loan-rules-editor">
      <h3 style={{ color: '#c9a84c', marginTop: 0 }}>Acquisition / Loan Rules Editor</h3>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <div>
          <label style={{ color: '#aaa', fontSize: 12 }}>Name</label>
          <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label style={{ color: '#aaa', fontSize: 12 }}>Type</label>
          <select style={inp} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="acquisition">acquisition</option>
            <option value="loan">loan</option>
          </select>
        </div>
        <div>
          <label style={{ color: '#aaa', fontSize: 12 }}>Condition</label>
          <input style={inp} value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} placeholder="e.g. object.provenance != null" />
        </div>
        <div>
          <label style={{ color: '#aaa', fontSize: 12 }}>Action</label>
          <select style={inp} value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}>
            <option value="allow">allow</option>
            <option value="deny">deny</option>
            <option value="require_approval">require_approval</option>
          </select>
        </div>
        <div>
          <label style={{ color: '#aaa', fontSize: 12 }}>Priority</label>
          <input type="number" style={inp} value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <label style={{ color: '#aaa', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
            Enabled
          </label>
        </div>
        <div style={{ gridColumn: '1 / 3' }}>
          <label style={{ color: '#aaa', fontSize: 12 }}>Notes</label>
          <textarea rows={2} style={inp} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div style={{ gridColumn: '1 / 3', display: 'flex', gap: 10 }}>
          <button type="submit"
            style={{ padding: '10px 18px', background: '#c9a84c', color: '#1a1a2a', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
            {editingId ? 'Update Rule' : 'Create Rule'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}
              style={{ padding: '10px 18px', background: '#444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <div style={{ color: '#E53E3E', marginBottom: 12 }}>Error: {error}</div>}
      {loading ? <div style={{ color: '#aaa' }}>Loading rules...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#aaa', textAlign: 'left' }}>
              <th style={{ padding: 6 }}>#</th>
              <th style={{ padding: 6 }}>Name</th>
              <th style={{ padding: 6 }}>Type</th>
              <th style={{ padding: 6 }}>Action</th>
              <th style={{ padding: 6 }}>Priority</th>
              <th style={{ padding: 6 }}>Enabled</th>
              <th style={{ padding: 6 }}></th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid #333', color: '#ddd' }}>
                <td style={{ padding: 6 }}>{r.id}</td>
                <td style={{ padding: 6 }}>{r.name}</td>
                <td style={{ padding: 6 }}>{r.type}</td>
                <td style={{ padding: 6 }}>{r.action}</td>
                <td style={{ padding: 6 }}>{r.priority}</td>
                <td style={{ padding: 6 }}>{r.enabled ? 'Yes' : 'No'}</td>
                <td style={{ padding: 6, textAlign: 'right' }}>
                  <button onClick={() => edit(r)} style={{ marginRight: 6, background: '#2E86AB', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => remove(r.id)} style={{ background: '#E53E3E', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
