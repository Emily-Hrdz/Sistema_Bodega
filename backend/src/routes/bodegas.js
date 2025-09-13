const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todas las bodegas
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bodegas ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear una nueva bodega
router.post('/', async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad } = req.body;
    const result = await db.query(
      'INSERT INTO bodegas (nombre, ubicacion, capacidad, ocupacion) VALUES ($1,$2,$3,0) RETURNING *',
      [nombre, ubicacion, capacidad]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
