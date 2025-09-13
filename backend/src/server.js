require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/bodegas', require('./routes/bodegas'));
app.use('/api/tipos', require('./routes/tipos'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/inventario', require('./routes/inventario'));
app.use('/api/ingresos', require('./routes/ingresos'));
app.use('/api/despachos', require('./routes/despachos'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
