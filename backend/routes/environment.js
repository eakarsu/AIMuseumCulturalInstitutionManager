import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all environment logs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM environment_logs ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET environment log by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM environment_logs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create environment log
router.post('/', async (req, res) => {
  try {
    const { gallery_id, temperature, humidity, light_level, co2_level, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO environment_logs (gallery_id, temperature, humidity, light_level, co2_level, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [gallery_id, temperature, humidity, light_level, co2_level, status, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update environment log
router.put('/:id', async (req, res) => {
  try {
    const { gallery_id, temperature, humidity, light_level, co2_level, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE environment_logs SET gallery_id = $1, temperature = $2, humidity = $3, light_level = $4,
       co2_level = $5, status = $6, notes = $7 WHERE id = $8 RETURNING *`,
      [gallery_id, temperature, humidity, light_level, co2_level, status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE environment log
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM environment_logs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /check-alerts — query recent logs, create maintenance_requests for out-of-range
router.post('/check-alerts', async (req, res) => {
  try {
    // Ensure maintenance_requests table exists
    await pool.query(`CREATE TABLE IF NOT EXISTS maintenance_requests (
      id SERIAL PRIMARY KEY, title TEXT, location TEXT, type VARCHAR(100),
      priority VARCHAR(50) DEFAULT 'medium', status VARCHAR(50) DEFAULT 'open',
      reported_by TEXT, assigned_to TEXT, reported_date DATE, completed_date DATE,
      cost DECIMAL(10,2), description TEXT, created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Fetch recent environment logs (last 24h)
    const recentLogs = await pool.query(
      `SELECT * FROM environment_logs WHERE created_at >= NOW() - INTERVAL '24 hours' ORDER BY created_at DESC`
    );

    const outOfRange = [];
    const alertsCreated = [];

    for (const log of recentLogs.rows) {
      const issues = [];
      if (log.temperature !== null && (parseFloat(log.temperature) < 18 || parseFloat(log.temperature) > 22)) {
        issues.push(`Temperature ${log.temperature}°C (safe: 18-22°C)`);
      }
      if (log.humidity !== null && (parseFloat(log.humidity) < 45 || parseFloat(log.humidity) > 55)) {
        issues.push(`Humidity ${log.humidity}% (safe: 45-55%)`);
      }

      if (issues.length > 0) {
        outOfRange.push({ log_id: log.id, gallery_id: log.gallery_id, issues, recorded_at: log.created_at });
        const title = `Environmental Alert - Gallery ${log.gallery_id || 'Unknown'}`;
        const description = `Out-of-range readings detected: ${issues.join(', ')}. Logged at ${log.created_at}.`;
        const mr = await pool.query(
          `INSERT INTO maintenance_requests (title, location, type, priority, status, reported_by, reported_date, description)
           VALUES ($1, $2, 'environmental', 'high', 'open', 'system', CURRENT_DATE, $3) RETURNING *`,
          [title, `Gallery ${log.gallery_id || 'Unknown'}`, description]
        );
        alertsCreated.push(mr.rows[0]);
      }
    }

    res.json({
      alerts_created: alertsCreated.length,
      out_of_range_readings: outOfRange,
      maintenance_requests: alertsCreated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
