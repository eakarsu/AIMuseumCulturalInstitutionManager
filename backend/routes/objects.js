import { Router } from 'express';
import pool from '../db.js';
const router = Router();

// GET all objects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM objects ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET object by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM objects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create object
router.post('/', async (req, res) => {
  try {
    const { title, artist_creator, date_created, medium, dimensions, accession_number, provenance, condition, location, collection_id, photo_url, insurance_value, description } = req.body;
    const result = await pool.query(
      `INSERT INTO objects (title, artist_creator, date_created, medium, dimensions, accession_number, provenance, condition, location, collection_id, photo_url, insurance_value, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [title, artist_creator, date_created, medium, dimensions, accession_number, provenance, condition, location, collection_id, photo_url, insurance_value, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update object
router.put('/:id', async (req, res) => {
  try {
    const { title, artist_creator, date_created, medium, dimensions, accession_number, provenance, condition, location, collection_id, photo_url, insurance_value, description } = req.body;
    const result = await pool.query(
      `UPDATE objects SET title = $1, artist_creator = $2, date_created = $3, medium = $4, dimensions = $5,
       accession_number = $6, provenance = $7, condition = $8, location = $9, collection_id = $10,
       photo_url = $11, insurance_value = $12, description = $13 WHERE id = $14 RETURNING *`,
      [title, artist_creator, date_created, medium, dimensions, accession_number, provenance, condition, location, collection_id, photo_url, insurance_value, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE object
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM objects WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
