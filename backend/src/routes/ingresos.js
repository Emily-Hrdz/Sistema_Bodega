const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ingresos
router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM ingresos ORDER BY id');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST ingreso (y actualiza inventario)
router.post('/', async (req, res) => {
  try {
    const { producto_id, bodega_id, cantidad, observaciones } = req.body;
    const fecha = new Date().toISOString().split('T')[0];

    const r = await db.query(
      'INSERT INTO ingresos (fecha, producto_id, bodega_id, cantidad, observaciones) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [fecha, producto_id, bodega_id, cantidad, observaciones]
    );

    // actualizar inventario
    await db.query(
      'INSERT INTO inventario (bodega_id, producto_id, cantidad) VALUES ($1,$2,$3) ON CONFLICT (bodega_id, producto_id) DO UPDATE SET cantidad = inventario.cantidad + $3',
      [bodega_id, producto_id, cantidad]
    );

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
