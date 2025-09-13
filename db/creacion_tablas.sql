-- ================================
-- CREACIÓN DE TABLAS PARA SISTEMA DE BODEGA
-- ================================

-- ====================================
-- 1. Tipos de productos
-- ====================================
CREATE TABLE tipos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- ====================================
-- 2. Bodegas
-- ====================================
CREATE TABLE bodegas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion TEXT,
    capacidad INT DEFAULT 0,
    ocupacion INT DEFAULT 0
);

-- ====================================
-- 3. Productos
-- ====================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50),
    nombre VARCHAR(100) NOT NULL,
    tipo INT REFERENCES tipos(id) ON DELETE SET NULL,
    unidad VARCHAR(50)
);

-- ====================================
-- 4. Clientes
-- ====================================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nit VARCHAR(50),
    razon_social VARCHAR(150) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(50),
    email VARCHAR(100),
    direccion TEXT
);

-- ====================================
-- 5. Inventario (relación bodegas - productos)
-- ====================================
CREATE TABLE inventario (
    id SERIAL PRIMARY KEY,
    bodega_id INT REFERENCES bodegas(id) ON DELETE CASCADE,
    producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INT DEFAULT 0,
    UNIQUE (bodega_id, producto_id)
);

-- ====================================
-- 6. Ingresos
-- ====================================
CREATE TABLE ingresos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
    bodega_id INT REFERENCES bodegas(id) ON DELETE CASCADE,
    cantidad INT NOT NULL,
    observaciones TEXT
);

-- ====================================
-- 7. Despachos
-- ====================================
CREATE TABLE despachos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    cliente_id INT REFERENCES clientes(id) ON DELETE CASCADE,
    producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
    bodega_id INT REFERENCES bodegas(id) ON DELETE CASCADE,
    cantidad INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente'
);

-- ====================================
-- Índices adicionales (para rendimiento)
-- ====================================
CREATE INDEX idx_inventario_bodega ON inventario(bodega_id);
CREATE INDEX idx_inventario_producto ON inventario(producto_id);
CREATE INDEX idx_ingresos_fecha ON ingresos(fecha);
CREATE INDEX idx_despachos_fecha ON despachos(fecha);
