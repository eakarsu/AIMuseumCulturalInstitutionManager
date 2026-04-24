import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all security rounds
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM security_rounds ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET security round by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM security_rounds WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create security round
router.post('/', async (req, res) => {
  try {
    const { officer, date, start_time, end_time, zone, status, findings, incidents, doors_checked, cameras_reviewed, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO security_rounds (officer, date, start_time, end_time, zone, status, findings, incidents, doors_checked, cameras_reviewed, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [officer, date, start_time, end_time, zone, status, findings, incidents, doors_checked, cameras_reviewed, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update security round
router.put('/:id', async (req, res) => {
  try {
    const { officer, date, start_time, end_time, zone, status, findings, incidents, doors_checked, cameras_reviewed, notes } = req.body;
    const result = await pool.query(
      `UPDATE security_rounds SET officer = $1, date = $2, start_time = $3, end_time = $4, zone = $5,
       status = $6, findings = $7, incidents = $8, doors_checked = $9, cameras_reviewed = $10, notes = $11 WHERE id = $12 RETURNING *`,
      [officer, date, start_time, end_time, zone, status, findings, incidents, doors_checked, cameras_reviewed, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE security round
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM security_rounds WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
