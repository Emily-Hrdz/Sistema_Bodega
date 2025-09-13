const express = require('express');
const router = express.Router();
const db = require('../db');

// GET inventario completo
router.get('/', async (req, res) => {
  try {
    const r = await db.query(
      `SELECT i.id, b.nombre as bodega, p.nombre as producto, i.cantidad
       FROM inventario i
       JOIN bodegas b ON b.id = i.bodega_id
       JOIN productos p ON p.id = i.producto_id
       ORDER BY bodega, producto`
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
