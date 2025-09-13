- ====================================
-- DATOS INICIALES
-- ====================================

-- Tipo
INSERT INTO tipos (nombre, descripcion) VALUES ('Alimentos', 'Productos comestibles');

-- Bodega
INSERT INTO bodegas (nombre, ubicacion, capacidad, ocupacion) 
VALUES ('Bodega Central', 'Zona 1', 1000, 0);

-- Producto
INSERT INTO productos (codigo, nombre, tipo, unidad) 
VALUES ('P001', 'Arroz', 1, 'kg');

-- Cliente
INSERT INTO clientes (nit, razon_social, contacto, telefono, email, direccion) 
VALUES ('123456-7', 'Cliente Ejemplo', 'Juan Perez', '5555-5555', 'cliente@example.com', 'Ciudad');

-- Inventario inicial (100 unidades de arroz en la bodega central)
INSERT INTO inventario (bodega_id, producto_id, cantidad) 
VALUES (1, 1, 100);
