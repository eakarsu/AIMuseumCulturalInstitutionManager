import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all donors
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donors ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET donor by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create donor
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, type, total_given, last_gift_date, status, steward, notes, recognition_level } = req.body;
    const result = await pool.query(
      `INSERT INTO donors (name, email, phone, type, total_given, last_gift_date, status, steward, notes, recognition_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, email, phone, type, total_given, last_gift_date, status, steward, notes, recognition_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update donor
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, type, total_given, last_gift_date, status, steward, notes, recognition_level } = req.body;
    const result = await pool.query(
      `UPDATE donors SET name = $1, email = $2, phone = $3, type = $4, total_given = $5,
       last_gift_date = $6, status = $7, steward = $8, notes = $9, recognition_level = $10 WHERE id = $11 RETURNING *`,
      [name, email, phone, type, total_given, last_gift_date, status, steward, notes, recognition_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE donor
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM donors WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
