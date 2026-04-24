import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all galleries
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM galleries ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET gallery by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM galleries WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create gallery
router.post('/', async (req, res) => {
  try {
    const { name, location, capacity, square_footage, climate_controlled, current_exhibition, status, floor, wing } = req.body;
    const result = await pool.query(
      `INSERT INTO galleries (name, location, capacity, square_footage, climate_controlled, current_exhibition, status, floor, wing)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, location, capacity, square_footage, climate_controlled, current_exhibition, status, floor, wing]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update gallery
router.put('/:id', async (req, res) => {
  try {
    const { name, location, capacity, square_footage, climate_controlled, current_exhibition, status, floor, wing } = req.body;
    const result = await pool.query(
      `UPDATE galleries SET name = $1, location = $2, capacity = $3, square_footage = $4, climate_controlled = $5,
       current_exhibition = $6, status = $7, floor = $8, wing = $9 WHERE id = $10 RETURNING *`,
      [name, location, capacity, square_footage, climate_controlled, current_exhibition, status, floor, wing, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE gallery
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM galleries WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
