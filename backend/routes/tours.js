import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all tours
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tours ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET tour by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tours WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create tour
router.post('/', async (req, res) => {
  try {
    const { name, date, time, guide_id, type, capacity, booked, duration, price, status, language, meeting_point } = req.body;
    const result = await pool.query(
      `INSERT INTO tours (name, date, time, guide_id, type, capacity, booked, duration, price, status, language, meeting_point)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [name, date, time, guide_id, type, capacity, booked, duration, price, status, language, meeting_point]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update tour
router.put('/:id', async (req, res) => {
  try {
    const { name, date, time, guide_id, type, capacity, booked, duration, price, status, language, meeting_point } = req.body;
    const result = await pool.query(
      `UPDATE tours SET name = $1, date = $2, time = $3, guide_id = $4, type = $5, capacity = $6,
       booked = $7, duration = $8, price = $9, status = $10, language = $11, meeting_point = $12 WHERE id = $13 RETURNING *`,
      [name, date, time, guide_id, type, capacity, booked, duration, price, status, language, meeting_point, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE tour
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tours WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
