const express = require('express');
const router = express.Router();
const db = require('../db');

// GET productos
router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM productos ORDER BY id');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST producto
router.post('/', async (req, res) => {
  try {
    const { codigo, nombre, tipo, unidad } = req.body;
    const r = await db.query(
      'INSERT INTO productos (codigo, nombre, tipo, unidad) VALUES ($1,$2,$3,$4) RETURNING *',
      [codigo, nombre, tipo, unidad]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
