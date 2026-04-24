import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all events
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET event by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create event
router.post('/', async (req, res) => {
  try {
    const { name, type, date, start_time, end_time, location, capacity, registered, price, status, contact, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO events (name, type, date, start_time, end_time, location, capacity, registered, price, status, contact, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [name, type, date, start_time, end_time, location, capacity, registered, price, status, contact, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update event
router.put('/:id', async (req, res) => {
  try {
    const { name, type, date, start_time, end_time, location, capacity, registered, price, status, contact, notes } = req.body;
    const result = await pool.query(
      `UPDATE events SET name = $1, type = $2, date = $3, start_time = $4, end_time = $5, location = $6,
       capacity = $7, registered = $8, price = $9, status = $10, contact = $11, notes = $12 WHERE id = $13 RETURNING *`,
      [name, type, date, start_time, end_time, location, capacity, registered, price, status, contact, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
