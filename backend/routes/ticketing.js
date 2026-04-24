import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all tickets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tickets ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ticket by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create ticket
router.post('/', async (req, res) => {
  try {
    const { visitor_name, email, visit_date, ticket_type, quantity, amount, payment_method, status, exhibition_id } = req.body;
    const result = await pool.query(
      `INSERT INTO tickets (visitor_name, email, visit_date, ticket_type, quantity, amount, payment_method, status, exhibition_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [visitor_name, email, visit_date, ticket_type, quantity, amount, payment_method, status, exhibition_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update ticket
router.put('/:id', async (req, res) => {
  try {
    const { visitor_name, email, visit_date, ticket_type, quantity, amount, payment_method, status, exhibition_id } = req.body;
    const result = await pool.query(
      `UPDATE tickets SET visitor_name = $1, email = $2, visit_date = $3, ticket_type = $4, quantity = $5,
       amount = $6, payment_method = $7, status = $8, exhibition_id = $9 WHERE id = $10 RETURNING *`,
      [visitor_name, email, visit_date, ticket_type, quantity, amount, payment_method, status, exhibition_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ticket
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
