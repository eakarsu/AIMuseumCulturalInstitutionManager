import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all conservation records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM conservation ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET conservation record by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM conservation WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create conservation record
router.post('/', async (req, res) => {
  try {
    const { object_id, report_date, conservator, condition_before, condition_after, treatment, materials_used, hours_spent, cost, next_review, priority, status } = req.body;
    const result = await pool.query(
      `INSERT INTO conservation (object_id, report_date, conservator, condition_before, condition_after, treatment, materials_used, hours_spent, cost, next_review, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [object_id, report_date, conservator, condition_before, condition_after, treatment, materials_used, hours_spent, cost, next_review, priority, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update conservation record
router.put('/:id', async (req, res) => {
  try {
    const { object_id, report_date, conservator, condition_before, condition_after, treatment, materials_used, hours_spent, cost, next_review, priority, status } = req.body;
    const result = await pool.query(
      `UPDATE conservation SET object_id = $1, report_date = $2, conservator = $3, condition_before = $4,
       condition_after = $5, treatment = $6, materials_used = $7, hours_spent = $8, cost = $9,
       next_review = $10, priority = $11, status = $12 WHERE id = $13 RETURNING *`,
      [object_id, report_date, conservator, condition_before, condition_after, treatment, materials_used, hours_spent, cost, next_review, priority, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE conservation record
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM conservation WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
