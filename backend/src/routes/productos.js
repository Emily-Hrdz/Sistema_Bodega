const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM productos ORDER BY id');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, tipo, unidad } = req.body;
    const r = await db.query(
      'UPDATE productos SET codigo=$1, nombre=$2, tipo=$3, unidad=$4 WHERE id=$5 RETURNING *',
      [codigo, nombre, tipo, unidad, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const r = await db.query('DELETE FROM productos WHERE id=$1 RETURNING *', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado', producto: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
