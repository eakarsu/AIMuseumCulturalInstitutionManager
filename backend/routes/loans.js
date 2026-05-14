import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all loans (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const total = await pool.query('SELECT COUNT(*) FROM loans');
    const result = await pool.query('SELECT * FROM loans ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({
      data: result.rows,
      page,
      limit,
      total: parseInt(total.rows[0].count),
      totalPages: Math.ceil(parseInt(total.rows[0].count) / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET loan by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM loans WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create loan
router.post('/', async (req, res) => {
  try {
    const { object_id, type, institution, contact_person, contact_email, start_date, end_date, status, insurance_value, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO loans (object_id, type, institution, contact_person, contact_email, start_date, end_date, status, insurance_value, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [object_id, type, institution, contact_person, contact_email, start_date, end_date, status, insurance_value, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update loan
router.put('/:id', async (req, res) => {
  try {
    const { object_id, type, institution, contact_person, contact_email, start_date, end_date, status, insurance_value, notes } = req.body;
    const result = await pool.query(
      `UPDATE loans SET object_id = $1, type = $2, institution = $3, contact_person = $4, contact_email = $5,
       start_date = $6, end_date = $7, status = $8, insurance_value = $9, notes = $10 WHERE id = $11 RETURNING *`,
      [object_id, type, institution, contact_person, contact_email, start_date, end_date, status, insurance_value, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE loan
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM loans WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
