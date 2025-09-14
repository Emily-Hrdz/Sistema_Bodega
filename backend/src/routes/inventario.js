const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: listar inventario completo
router.get('/', async (req, res) => {
  try {
    const r = await db.query(`
      SELECT i.id, b.nombre AS bodega, p.nombre AS producto, i.cantidad
      FROM inventario i
      JOIN bodegas b ON i.bodega_id = b.id
      JOIN productos p ON i.producto_id = p.id
      ORDER BY bodega, producto
    `);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET: inventario de una bodega específica
router.get('/:bodega_id', async (req, res) => {
  try {
    const { bodega_id } = req.params;
    const r = await db.query(
      `
      SELECT i.id, b.nombre AS bodega, p.nombre AS producto, i.cantidad
      FROM inventario i
      JOIN bodegas b ON i.bodega_id = b.id
      JOIN productos p ON i.producto_id = p.id
      WHERE i.bodega_id=$1
      ORDER BY producto
    `,
      [bodega_id]
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
