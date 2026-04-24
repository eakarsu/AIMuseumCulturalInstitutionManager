import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all volunteers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM volunteers ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET volunteer by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM volunteers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create volunteer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role, status, start_date, hours_completed, availability, skills, certifications } = req.body;
    const result = await pool.query(
      `INSERT INTO volunteers (name, email, phone, role, status, start_date, hours_completed, availability, skills, certifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, email, phone, role, status, start_date, hours_completed, availability, skills, certifications]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update volunteer
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, role, status, start_date, hours_completed, availability, skills, certifications } = req.body;
    const result = await pool.query(
      `UPDATE volunteers SET name = $1, email = $2, phone = $3, role = $4, status = $5, start_date = $6,
       hours_completed = $7, availability = $8, skills = $9, certifications = $10 WHERE id = $11 RETURNING *`,
      [name, email, phone, role, status, start_date, hours_completed, availability, skills, certifications, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE volunteer
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM volunteers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
