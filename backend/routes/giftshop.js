import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all gift shop items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gift_shop_items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET gift shop item by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gift_shop_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create gift shop item
router.post('/', async (req, res) => {
  try {
    const { name, category, price, cost, quantity, sku, supplier, reorder_point, status, description } = req.body;
    const result = await pool.query(
      `INSERT INTO gift_shop_items (name, category, price, cost, quantity, sku, supplier, reorder_point, status, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, category, price, cost, quantity, sku, supplier, reorder_point, status, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update gift shop item
router.put('/:id', async (req, res) => {
  try {
    const { name, category, price, cost, quantity, sku, supplier, reorder_point, status, description } = req.body;
    const result = await pool.query(
      `UPDATE gift_shop_items SET name = $1, category = $2, price = $3, cost = $4, quantity = $5,
       sku = $6, supplier = $7, reorder_point = $8, status = $9, description = $10 WHERE id = $11 RETURNING *`,
      [name, category, price, cost, quantity, sku, supplier, reorder_point, status, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE gift shop item
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM gift_shop_items WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
