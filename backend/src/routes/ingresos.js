const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: listar ingresos
router.get('/', async (req, res) => {
  try {
    const r = await db.query(`
      SELECT i.*, p.nombre AS producto, b.nombre AS bodega
      FROM ingresos i
      JOIN productos p ON i.producto_id = p.id
      JOIN bodegas b ON i.bodega_id = b.id
      ORDER BY i.id DESC
    `);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST: registrar ingreso
router.post('/', async (req, res) => {
  try {
    const { producto_id, bodega_id, cantidad, observaciones } = req.body;
    const r = await db.query(
      'INSERT INTO ingresos (fecha, producto_id, bodega_id, cantidad, observaciones) VALUES (CURRENT_DATE,$1,$2,$3,$4) RETURNING *',
      [producto_id, bodega_id, cantidad, observaciones]
    );

    // actualizar inventario
    await db.query(
      `INSERT INTO inventario (bodega_id, producto_id, cantidad)
       VALUES ($1, $2, $3)
       ON CONFLICT (bodega_id, producto_id)
       DO UPDATE SET cantidad = inventario.cantidad + EXCLUDED.cantidad`,
      [bodega_id, producto_id, cantidad]
    );

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT: actualizar ingreso
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, observaciones } = req.body;
    const r = await db.query(
      'UPDATE ingresos SET cantidad=$1, observaciones=$2 WHERE id=$3 RETURNING *',
      [cantidad, observaciones, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Ingreso no encontrado' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE: eliminar ingreso
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // obtener ingreso para revertir inventario
    const ingreso = await db.query('SELECT * FROM ingresos WHERE id=$1', [id]);
    if (ingreso.rows.length === 0) return res.status(404).json({ error: 'Ingreso no encontrado' });
    const { producto_id, bodega_id, cantidad } = ingreso.rows[0];

    // eliminar ingreso
    const r = await db.query('DELETE FROM ingresos WHERE id=$1 RETURNING *', [id]);

    // descontar del inventario
    await db.query(
      'UPDATE inventario SET cantidad = cantidad - $1 WHERE bodega_id=$2 AND producto_id=$3',
      [cantidad, bodega_id, producto_id]
    );

    res.json({ message: 'Ingreso eliminado', ingreso: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
