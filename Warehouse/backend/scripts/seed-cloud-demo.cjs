// Fictional presentation data only. Never imports local records, people, passwords or .env.
const { PrismaClient } = require('@prisma/client');
const { configuration } = require('./start-render.cjs');

const products = [
  ['PROD-001', 'Arroz blanco 1 kg'],
  ['PROD-002', 'Frijol negro 1 kg'],
  ['PROD-003', 'Atún en lata 140 g'],
  ['PROD-004', 'Agua purificada 1 litro'],
  ['PROD-005', 'Avena en bolsa 500 g'],
  ['PROD-006', 'Azúcar blanca 1 kg'],
];

const additionalProducts = [
  ['PROD-007', 'Lenteja 1 kg', 'Granos y cereales', 'Bolsa', true],
  ['PROD-008', 'Pasta tipo espagueti 400 g', 'Granos y cereales', 'Paquete', true],
  ['PROD-009', 'Maíz dulce en lata 300 g', 'Conservas', 'Lata', true],
  ['PROD-010', 'Sardinas en salsa de tomate 155 g', 'Conservas', 'Lata', true],
  ['PROD-011', 'Jugo de naranja 1 litro', 'Bebidas', 'Caja', true],
  ['PROD-012', 'Café molido 250 g', 'Bebidas', 'Bolsa', true],
  ['PROD-013', 'Leche entera UHT 1 litro', 'Lácteos', 'Caja', true],
  ['PROD-014', 'Leche en polvo 400 g', 'Lácteos', 'Lata', true],
  ['PROD-015', 'Galletas integrales 200 g', 'Granos y cereales', 'Paquete', false],
  ['PROD-016', 'Duraznos en almíbar 820 g', 'Conservas', 'Lata', false],
];

// Update only records created by the previous cloud seed. Keep their IDs so
// existing Kardex movements and relationships remain intact.
async function normalizeCloudSeed(db) {
  return db.$transaction(async tx => {
    async function rename(model, field, oldValue, newValue, extra = {}) {
      const oldRecord = await tx[model].findUnique({ where: { [field]: oldValue } });
      if (!oldRecord) return;
      const newRecord = await tx[model].findUnique({ where: { [field]: newValue } });
      if (newRecord && newRecord.id !== oldRecord.id) {
        throw new Error(`El código o nombre ${newValue} ya pertenece a otro registro.`);
      }
      await tx[model].update({ where: { id: oldRecord.id }, data: { [field]: newValue, ...extra } });
    }

    await rename('bodega', 'nombre', 'Bodega demo Amatitlan', 'Bodega 1 Amatitlán', { ubicacion: 'Amatitlán, Guatemala' });
    await rename('bodega', 'nombre', 'Bodega demo inactiva', 'Bodega 2 Villa Nueva', { ubicacion: 'Villa Nueva, Guatemala' });
    await rename('tipoProducto', 'nombre', 'Alimentos de demostración', 'Alimentos y abarrotes');
    await rename('container', 'codigo', 'DEMO-C01', 'CONT-001', { descripcion: 'Estante A1' });
    await rename('container', 'codigo', 'DEMO-C02', 'CONT-002');
    await rename('lote', 'codigo', 'DEMO-L01', 'LOTE-001');
    await rename('lote', 'codigo', 'DEMO-L02', 'LOTE-002');
    await rename('cliente', 'codigo', 'DEMO-CLI01', 'CLI-001', { nombre: 'Comercial El Lago', email: null });
    await rename('cliente', 'codigo', 'DEMO-CLI02', 'CLI-002', { nombre: 'Abarrotería Central' });
    await rename('tipoMovimiento', 'codigo', 'DEMO-ENTRADA', 'ENT-001', { nombre: 'Recepción de mercancía' });
    await rename('tipoMovimiento', 'codigo', 'DEMO-SALIDA', 'SAL-001', { nombre: 'Despacho a cliente' });
    for (const [index, [code, name]] of products.entries()) {
      await rename('producto', 'codigo', `DEMO-P0${index + 1}`, code, { nombre: name });
    }
    await tx.kardex.updateMany({ where: { observaciones: '[DEMO-NUBE] Entrada ficticia' }, data: { observaciones: 'Recepción de mercancía' } });
    await tx.kardex.updateMany({ where: { observaciones: '[DEMO-NUBE] Salida ficticia' }, data: { observaciones: 'Despacho a cliente' } });
  }, { isolationLevel: 'Serializable', timeout: 30000 });
}

async function seedCloudDemo(db) {
  return db.$transaction(async tx => {
    await tx.bodega.upsert({ where: { nombre: 'Bodega 1 Amatitlán' }, update: {}, create: { nombre: 'Bodega 1 Amatitlán', ubicacion: 'Amatitlán, Guatemala' } });
    await tx.bodega.upsert({ where: { nombre: 'Bodega 2 Villa Nueva' }, update: {}, create: { nombre: 'Bodega 2 Villa Nueva', ubicacion: 'Villa Nueva, Guatemala', activo: false } });
    for (const [nombre, ubicacion, activo] of [
      ['Bodega 3 Quetzaltenango', 'Quetzaltenango, Guatemala', true],
      ['Bodega 4 Escuintla', 'Escuintla, Guatemala', true],
      ['Bodega 5 Antigua Guatemala', 'Antigua Guatemala, Sacatepéquez', false],
    ]) await tx.bodega.upsert({ where: { nombre }, update: {}, create: { nombre, ubicacion, activo } });
    const category = await tx.tipoProducto.upsert({ where: { nombre: 'Alimentos y abarrotes' }, update: {}, create: { nombre: 'Alimentos y abarrotes' } });
    const categories = { [category.nombre]: category };
    for (const nombre of ['Granos y cereales', 'Conservas', 'Bebidas', 'Lácteos']) {
      categories[nombre] = await tx.tipoProducto.upsert({ where: { nombre }, update: {}, create: { nombre } });
    }
    await tx.container.upsert({ where: { codigo: 'CONT-001' }, update: {}, create: { codigo: 'CONT-001', descripcion: 'Estante A1' } });
    await tx.container.upsert({ where: { codigo: 'CONT-002' }, update: {}, create: { codigo: 'CONT-002', descripcion: 'Contenedor de reserva', activo: false } });
    for (const [codigo, descripcion, activo] of [
      ['CONT-003', 'Estante A2', true], ['CONT-004', 'Tarima B1', true],
      ['CONT-005', 'Estante de bebidas', true], ['CONT-006', 'Tarima de reserva', false],
    ]) await tx.container.upsert({ where: { codigo }, update: {}, create: { codigo, descripcion, activo } });
    await tx.lote.upsert({ where: { codigo: 'LOTE-001' }, update: {}, create: { codigo: 'LOTE-001', fechaVencimiento: new Date('2028-12-31T12:00:00Z') } });
    await tx.lote.upsert({ where: { codigo: 'LOTE-002' }, update: {}, create: { codigo: 'LOTE-002', activo: false } });
    for (const [codigo, fechaVencimiento, activo] of [
      ['LOTE-003', '2028-06-30T12:00:00Z', true], ['LOTE-004', '2029-03-31T12:00:00Z', true],
      ['LOTE-005', '2029-09-30T12:00:00Z', true], ['LOTE-006', null, false],
    ]) await tx.lote.upsert({ where: { codigo }, update: {}, create: { codigo, fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null, activo } });
    await tx.cliente.upsert({ where: { codigo: 'CLI-001' }, update: {}, create: { codigo: 'CLI-001', nombre: 'Comercial El Lago', telefono: '12345678' } });
    await tx.cliente.upsert({ where: { codigo: 'CLI-002' }, update: {}, create: { codigo: 'CLI-002', nombre: 'Abarrotería Central', telefono: '12345678', activo: false } });
    for (const [codigo, nombre, activo] of [
      ['CLI-003', 'Tienda Las Flores', true], ['CLI-004', 'Distribuidora Los Pinos', true],
      ['CLI-005', 'Mercado La Esperanza', true], ['CLI-006', 'Comercial Santa Clara', false],
    ]) await tx.cliente.upsert({ where: { codigo }, update: {}, create: { codigo, nombre, telefono: '12345678', activo } });
    for (const [tipo, codigo, nombre] of [['ENTRADA', 'ENT-001', 'Recepción de mercancía'], ['SALIDA', 'SAL-001', 'Despacho a cliente']]) {
      await tx.tipoMovimiento.upsert({ where: { codigo }, update: {}, create: { codigo, nombre, tipo } });
    }
    for (const [codigo, nombre, tipo] of [
      ['ENT-002', 'Devolución de cliente', 'ENTRADA'],
      ['SAL-002', 'Merma de producto', 'SALIDA'],
    ]) await tx.tipoMovimiento.upsert({ where: { codigo }, update: {}, create: { codigo, nombre, tipo } });
    for (const [index, [codigo, nombre]] of products.entries()) {
      await tx.producto.upsert({ where: { codigo }, update: {}, create: { codigo, nombre, tipoProductoId: category.id, unidadMedida: 'Unidad', activo: index < 5 } });
    }
    for (const [codigo, nombre, tipoProducto, unidadMedida, activo] of additionalProducts) {
      await tx.producto.upsert({ where: { codigo }, update: {}, create: { codigo, nombre, tipoProductoId: categories[tipoProducto].id, unidadMedida, activo } });
    }
    // Catalog additions never create, delete or adjust Kardex movements or balances.
  }, { isolationLevel: 'Serializable', timeout: 30000 });
}
async function main() {
  configuration(process.env);
  const db = new PrismaClient();
  try {
    await normalizeCloudSeed(db);
    await seedCloudDemo(db);
    console.log('Catálogos de presentación actualizados sin modificar Kardex.');
  }
  finally { await db.$disconnect(); }
}
if (require.main === module) main().catch(() => { console.error('Falló la carga de datos. Revise la conexión y las migraciones.'); process.exitCode = 1; });
module.exports = { normalizeCloudSeed, seedCloudDemo };
