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
    const warehouse = await tx.bodega.upsert({ where: { nombre: 'Bodega 1 Amatitlán' }, update: {}, create: { nombre: 'Bodega 1 Amatitlán', ubicacion: 'Amatitlán, Guatemala' } });
    await tx.bodega.upsert({ where: { nombre: 'Bodega 2 Villa Nueva' }, update: {}, create: { nombre: 'Bodega 2 Villa Nueva', ubicacion: 'Villa Nueva, Guatemala', activo: false } });
    const category = await tx.tipoProducto.upsert({ where: { nombre: 'Alimentos y abarrotes' }, update: {}, create: { nombre: 'Alimentos y abarrotes' } });
    const container = await tx.container.upsert({ where: { codigo: 'CONT-001' }, update: {}, create: { codigo: 'CONT-001', descripcion: 'Estante A1' } });
    await tx.container.upsert({ where: { codigo: 'CONT-002' }, update: {}, create: { codigo: 'CONT-002', descripcion: 'Contenedor de reserva', activo: false } });
    const lote = await tx.lote.upsert({ where: { codigo: 'LOTE-001' }, update: {}, create: { codigo: 'LOTE-001', fechaVencimiento: new Date('2028-12-31T12:00:00Z') } });
    await tx.lote.upsert({ where: { codigo: 'LOTE-002' }, update: {}, create: { codigo: 'LOTE-002', activo: false } });
    const client = await tx.cliente.upsert({ where: { codigo: 'CLI-001' }, update: {}, create: { codigo: 'CLI-001', nombre: 'Comercial El Lago', telefono: '12345678' } });
    await tx.cliente.upsert({ where: { codigo: 'CLI-002' }, update: {}, create: { codigo: 'CLI-002', nombre: 'Abarrotería Central', telefono: '12345678', activo: false } });
    const types = {};
    for (const [tipo, codigo, nombre] of [['ENTRADA', 'ENT-001', 'Recepción de mercancía'], ['SALIDA', 'SAL-001', 'Despacho a cliente']]) {
      types[tipo] = await tx.tipoMovimiento.upsert({ where: { codigo }, update: {}, create: { codigo, nombre, tipo } });
    }
    for (const [index, [codigo, nombre]] of products.entries()) {
      const product = await tx.producto.upsert({ where: { codigo }, update: {}, create: { codigo, nombre, tipoProductoId: category.id, unidadMedida: 'Unidad', activo: index < 5 } });
      // Do not reset balances or recreate history for an already-used product.
      if (index >= 5 || await tx.kardex.count({ where: { bodegaId: warehouse.id, productoId: product.id } })) continue;
      const quantity = 100 + index * 20;
      const date = new Date(Date.now() - (5 - index) * 86400000);
      await tx.kardex.create({ data: { bodegaId: warehouse.id, productoId: product.id, containerId: container.id, loteId: lote.id, tipoMovimientoId: types.ENTRADA.id, fecha: date, cantidad: quantity, saldoAnterior: 0, saldoNuevo: quantity, observaciones: 'Recepción de mercancía' } });
      await tx.kardex.create({ data: { bodegaId: warehouse.id, productoId: product.id, clienteId: client.id, tipoMovimientoId: types.SALIDA.id, fecha: new Date(date.getTime() + 3600000), cantidad: 20, saldoAnterior: quantity, saldoNuevo: quantity - 20, observaciones: 'Despacho a cliente' } });
    }
  }, { isolationLevel: 'Serializable', timeout: 30000 });
}
async function main() {
  configuration(process.env);
  const db = new PrismaClient();
  try {
    await normalizeCloudSeed(db);
    if (process.env.SEED_DEMO === 'true') await seedCloudDemo(db);
    console.log('Nombres y códigos de presentación actualizados.');
  }
  finally { await db.$disconnect(); }
}
if (require.main === module) main().catch(() => { console.error('Falló la carga de datos. Revise la conexión y las migraciones.'); process.exitCode = 1; });
module.exports = { normalizeCloudSeed, seedCloudDemo };
