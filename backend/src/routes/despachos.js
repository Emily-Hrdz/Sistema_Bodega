const express = require('express');
const router = express.Router();
const db = require('../db');

// GET despachos
router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM despachos ORDER BY id');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST despacho (y descuenta inventario)
router.post('/', async (req, res) => {
  try {
    const { cliente_id, producto_id, bodega_id, cantidad } = req.body;
    const fecha = new Date().toISOString().split('T')[0];

    const r = await db.query(
      'INSERT INTO despachos (fecha, cliente_id, producto_id, bodega_id, cantidad, estado) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [fecha, cliente_id, producto_id, bodega_id, cantidad, 'Pendiente']
    );

    // actualizar inventario
    await db.query(
      'UPDATE inventario SET cantidad = cantidad - $3 WHERE bodega_id = $1 AND producto_id = $2',
      [bodega_id, producto_id, cantidad]
    );

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
