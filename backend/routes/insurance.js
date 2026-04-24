import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all insurance records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM insurance_records ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET insurance record by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM insurance_records WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create insurance record
router.post('/', async (req, res) => {
  try {
    const { object_id, policy_number, provider, coverage_amount, premium, start_date, end_date, type, status, appraised_value, appraisal_date } = req.body;
    const result = await pool.query(
      `INSERT INTO insurance_records (object_id, policy_number, provider, coverage_amount, premium, start_date, end_date, type, status, appraised_value, appraisal_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [object_id, policy_number, provider, coverage_amount, premium, start_date, end_date, type, status, appraised_value, appraisal_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update insurance record
router.put('/:id', async (req, res) => {
  try {
    const { object_id, policy_number, provider, coverage_amount, premium, start_date, end_date, type, status, appraised_value, appraisal_date } = req.body;
    const result = await pool.query(
      `UPDATE insurance_records SET object_id = $1, policy_number = $2, provider = $3, coverage_amount = $4,
       premium = $5, start_date = $6, end_date = $7, type = $8, status = $9, appraised_value = $10,
       appraisal_date = $11 WHERE id = $12 RETURNING *`,
      [object_id, policy_number, provider, coverage_amount, premium, start_date, end_date, type, status, appraised_value, appraisal_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE insurance record
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM insurance_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
