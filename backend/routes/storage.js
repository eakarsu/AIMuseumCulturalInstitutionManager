import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all storage locations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM storage_locations ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET storage location by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM storage_locations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create storage location
router.post('/', async (req, res) => {
  try {
    const { name, building, room, unit, shelf, capacity, current_count, climate_type, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO storage_locations (name, building, room, unit, shelf, capacity, current_count, climate_type, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, building, room, unit, shelf, capacity, current_count, climate_type, status, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update storage location
router.put('/:id', async (req, res) => {
  try {
    const { name, building, room, unit, shelf, capacity, current_count, climate_type, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE storage_locations SET name = $1, building = $2, room = $3, unit = $4, shelf = $5,
       capacity = $6, current_count = $7, climate_type = $8, status = $9, notes = $10 WHERE id = $11 RETURNING *`,
      [name, building, room, unit, shelf, capacity, current_count, climate_type, status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE storage location
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM storage_locations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
