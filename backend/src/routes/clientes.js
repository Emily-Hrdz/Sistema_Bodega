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

module.exports = router;
