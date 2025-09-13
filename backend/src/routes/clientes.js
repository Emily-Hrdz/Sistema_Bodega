const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM clientes ORDER BY id');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nit, razon_social, contacto, telefono, email, direccion } = req.body;
    const r = await db.query(
      'INSERT INTO clientes (nit, razon_social, contacto, telefono, email, direccion) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [nit, razon_social, contacto, telefono, email, direccion]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nit, razon_social, contacto, telefono, email, direccion } = req.body;
    const r = await db.query(
      'UPDATE clientes SET nit=$1, razon_social=$2, contacto=$3, telefono=$4, email=$5, direccion=$6 WHERE id=$7 RETURNING *',
      [nit, razon_social, contacto, telefono, email, direccion, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const r = await db.query('DELETE FROM clientes WHERE id=$1 RETURNING *', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado', cliente: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
