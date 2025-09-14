require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodegasRoutes = require('./routes/bodegas');
const tiposRoutes = require('./routes/tipos');
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const ingresosRoutes = require('./routes/ingresos');
const despachosRoutes = require('./routes/despachos');
const inventarioRoutes = require('./routes/inventario');


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
app.use('/api/bodegas', bodegasRoutes);
app.use('/api/tipos', tiposRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/despachos', despachosRoutes);
app.use('/api/inventario', inventarioRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
