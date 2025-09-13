const express = require('express');
const router = express.Router();
const db = require('../db');

// GET todos
router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM tipos ORDER BY id');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST crear
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const r = await db.query(
      'INSERT INTO tipos (nombre, descripcion) VALUES ($1,$2) RETURNING *',
      [nombre, descripcion]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
