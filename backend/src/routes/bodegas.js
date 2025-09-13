const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: listar todas las bodegas
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bodegas ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: crear bodega
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

// PUT: actualizar bodega
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ubicacion, capacidad, ocupacion } = req.body;
    const result = await db.query(
      'UPDATE bodegas SET nombre=$1, ubicacion=$2, capacidad=$3, ocupacion=$4 WHERE id=$5 RETURNING *',
      [nombre, ubicacion, capacidad, ocupacion, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bodega no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: eliminar bodega
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM bodegas WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bodega no encontrada' });
    res.json({ message: 'Bodega eliminada', bodega: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

