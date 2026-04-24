import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all memberships
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memberships ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET membership by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memberships WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create membership
router.post('/', async (req, res) => {
  try {
    const { member_name, email, phone, tier, start_date, end_date, status, benefits, annual_fee, auto_renew } = req.body;
    const result = await pool.query(
      `INSERT INTO memberships (member_name, email, phone, tier, start_date, end_date, status, benefits, annual_fee, auto_renew)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [member_name, email, phone, tier, start_date, end_date, status, benefits, annual_fee, auto_renew]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update membership
router.put('/:id', async (req, res) => {
  try {
    const { member_name, email, phone, tier, start_date, end_date, status, benefits, annual_fee, auto_renew } = req.body;
    const result = await pool.query(
      `UPDATE memberships SET member_name = $1, email = $2, phone = $3, tier = $4, start_date = $5,
       end_date = $6, status = $7, benefits = $8, annual_fee = $9, auto_renew = $10 WHERE id = $11 RETURNING *`,
      [member_name, email, phone, tier, start_date, end_date, status, benefits, annual_fee, auto_renew, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE membership
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM memberships WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
