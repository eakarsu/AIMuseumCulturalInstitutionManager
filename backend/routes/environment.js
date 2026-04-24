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

export default router;
