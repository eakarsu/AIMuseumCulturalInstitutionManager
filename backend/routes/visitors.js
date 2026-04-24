import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all visitor analytics
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitor_analytics ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET visitor analytics by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitor_analytics WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create visitor analytics record
router.post('/', async (req, res) => {
  try {
    const { date, total_visitors, members, adults, children, seniors, students, groups, peak_hour, avg_duration, top_exhibition, satisfaction_score, revenue, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO visitor_analytics (date, total_visitors, members, adults, children, seniors, students, groups, peak_hour, avg_duration, top_exhibition, satisfaction_score, revenue, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [date, total_visitors, members, adults, children, seniors, students, groups, peak_hour, avg_duration, top_exhibition, satisfaction_score, revenue, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update visitor analytics record
router.put('/:id', async (req, res) => {
  try {
    const { date, total_visitors, members, adults, children, seniors, students, groups, peak_hour, avg_duration, top_exhibition, satisfaction_score, revenue, notes } = req.body;
    const result = await pool.query(
      `UPDATE visitor_analytics SET date = $1, total_visitors = $2, members = $3, adults = $4, children = $5,
       seniors = $6, students = $7, groups = $8, peak_hour = $9, avg_duration = $10, top_exhibition = $11,
       satisfaction_score = $12, revenue = $13, notes = $14 WHERE id = $15 RETURNING *`,
      [date, total_visitors, members, adults, children, seniors, students, groups, peak_hour, avg_duration, top_exhibition, satisfaction_score, revenue, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE visitor analytics record
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM visitor_analytics WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
