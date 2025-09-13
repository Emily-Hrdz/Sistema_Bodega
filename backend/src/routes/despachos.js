const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: listar despachos
router.get('/', async (req, res) => {
  try {
    const r = await db.query(`
      SELECT d.*, c.razon_social AS cliente, p.nombre AS producto, b.nombre AS bodega
      FROM despachos d
      JOIN clientes c ON d.cliente_id = c.id
      JOIN productos p ON d.producto_id = p.id
      JOIN bodegas b ON d.bodega_id = b.id
      ORDER BY d.id DESC
    `);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST: registrar despacho
router.post('/', async (req, res) => {
  try {
    const { cliente_id, producto_id, bodega_id, cantidad } = req.body;

    // verificar stock
    const stock = await db.query(
      'SELECT cantidad FROM inventario WHERE bodega_id=$1 AND producto_id=$2',
      [bodega_id, producto_id]
    );
    if (stock.rows.length === 0 || stock.rows[0].cantidad < cantidad) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    const r = await db.query(
      'INSERT INTO despachos (fecha, cliente_id, producto_id, bodega_id, cantidad, estado) VALUES (CURRENT_DATE,$1,$2,$3,$4,\'Pendiente\') RETURNING *',
      [cliente_id, producto_id, bodega_id, cantidad]
    );

    // descontar inventario
    await db.query(
      'UPDATE inventario SET cantidad = cantidad - $1 WHERE bodega_id=$2 AND producto_id=$3',
      [cantidad, bodega_id, producto_id]
    );

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT: actualizar despacho (ej. cambiar estado)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const r = await db.query(
      'UPDATE despachos SET estado=$1 WHERE id=$2 RETURNING *',
      [estado, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Despacho no encontrado' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE: eliminar despacho
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // obtener despacho para revertir inventario
    const despacho = await db.query('SELECT * FROM despachos WHERE id=$1', [id]);
    if (despacho.rows.length === 0) return res.status(404).json({ error: 'Despacho no encontrado' });
    const { producto_id, bodega_id, cantidad } = despacho.rows[0];

    // eliminar despacho
    const r = await db.query('DELETE FROM despachos WHERE id=$1 RETURNING *', [id]);

    // devolver stock
    await db.query(
      'UPDATE inventario SET cantidad = cantidad + $1 WHERE bodega_id=$2 AND producto_id=$3',
      [cantidad, bodega_id, producto_id]
    );

    res.json({ message: 'Despacho eliminado y stock devuelto', despacho: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

