import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all maintenance requests
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_requests ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET maintenance request by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_requests WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create maintenance request
router.post('/', async (req, res) => {
  try {
    const { title, location, type, priority, status, reported_by, assigned_to, reported_date, completed_date, cost, description } = req.body;
    const result = await pool.query(
      `INSERT INTO maintenance_requests (title, location, type, priority, status, reported_by, assigned_to, reported_date, completed_date, cost, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title, location, type, priority, status, reported_by, assigned_to, reported_date, completed_date, cost, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update maintenance request
router.put('/:id', async (req, res) => {
  try {
    const { title, location, type, priority, status, reported_by, assigned_to, reported_date, completed_date, cost, description } = req.body;
    const result = await pool.query(
      `UPDATE maintenance_requests SET title = $1, location = $2, type = $3, priority = $4, status = $5,
       reported_by = $6, assigned_to = $7, reported_date = $8, completed_date = $9, cost = $10, description = $11 WHERE id = $12 RETURNING *`,
      [title, location, type, priority, status, reported_by, assigned_to, reported_date, completed_date, cost, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE maintenance request
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_requests WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
