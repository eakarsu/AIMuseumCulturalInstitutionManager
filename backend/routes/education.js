import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all education programs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM education_programs ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET education program by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM education_programs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create education program
router.post('/', async (req, res) => {
  try {
    const { name, type, age_group, instructor, schedule, capacity, enrolled, fee, status, description, materials } = req.body;
    const result = await pool.query(
      `INSERT INTO education_programs (name, type, age_group, instructor, schedule, capacity, enrolled, fee, status, description, materials)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, type, age_group, instructor, schedule, capacity, enrolled, fee, status, description, materials]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update education program
router.put('/:id', async (req, res) => {
  try {
    const { name, type, age_group, instructor, schedule, capacity, enrolled, fee, status, description, materials } = req.body;
    const result = await pool.query(
      `UPDATE education_programs SET name = $1, type = $2, age_group = $3, instructor = $4, schedule = $5,
       capacity = $6, enrolled = $7, fee = $8, status = $9, description = $10, materials = $11 WHERE id = $12 RETURNING *`,
      [name, type, age_group, instructor, schedule, capacity, enrolled, fee, status, description, materials, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE education program
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM education_programs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
