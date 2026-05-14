import { Router } from 'express';
import pool from '../db.js';
import { requireRole } from '../middleware/requireRole.js';
const router = Router();

// GET all collections (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const total = await pool.query('SELECT COUNT(*) FROM collections');
    const result = await pool.query('SELECT * FROM collections ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
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

// GET collection by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM collections WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create collection
router.post('/', async (req, res) => {
  try {
    const { name, description, category, acquisition_date, status, curator, total_items } = req.body;
    const result = await pool.query(
      `INSERT INTO collections (name, description, category, acquisition_date, status, curator, total_items)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, category, acquisition_date, status, curator, total_items]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update collection
router.put('/:id', async (req, res) => {
  try {
    const { name, description, category, acquisition_date, status, curator, total_items } = req.body;
    const result = await pool.query(
      `UPDATE collections SET name = $1, description = $2, category = $3, acquisition_date = $4,
       status = $5, curator = $6, total_items = $7 WHERE id = $8 RETURNING *`,
      [name, description, category, acquisition_date, status, curator, total_items, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE collection — admin/curator only
router.delete('/:id', requireRole('admin', 'curator'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM collections WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
