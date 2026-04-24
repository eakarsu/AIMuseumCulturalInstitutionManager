import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all exhibitions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exhibitions ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET exhibition by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exhibitions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create exhibition
router.post('/', async (req, res) => {
  try {
    const { title, description, start_date, end_date, gallery_id, curator, status, budget, theme } = req.body;
    const result = await pool.query(
      `INSERT INTO exhibitions (title, description, start_date, end_date, gallery_id, curator, status, budget, theme)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, start_date, end_date, gallery_id, curator, status, budget, theme]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update exhibition
router.put('/:id', async (req, res) => {
  try {
    const { title, description, start_date, end_date, gallery_id, curator, status, budget, theme } = req.body;
    const result = await pool.query(
      `UPDATE exhibitions SET title = $1, description = $2, start_date = $3, end_date = $4, gallery_id = $5,
       curator = $6, status = $7, budget = $8, theme = $9 WHERE id = $10 RETURNING *`,
      [title, description, start_date, end_date, gallery_id, curator, status, budget, theme, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE exhibition
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM exhibitions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
