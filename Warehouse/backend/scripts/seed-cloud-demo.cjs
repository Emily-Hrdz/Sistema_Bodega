// Fictional data only. Never imports local records, people, passwords or .env.
const { PrismaClient } = require('@prisma/client');
const { configuration } = require('./start-render.cjs');

async function seedCloudDemo(db) {
  return db.$transaction(async tx => {
    const warehouse = await tx.bodega.upsert({ where: { nombre: 'Bodega demo Amatitlan' }, update: {}, create: { nombre: 'Bodega demo Amatitlan', ubicacion: 'Amatitlan, Guatemala (demostración)' } });
    await tx.bodega.upsert({ where: { nombre: 'Bodega demo inactiva' }, update: {}, create: { nombre: 'Bodega demo inactiva', ubicacion: 'Registro ficticio', activo: false } });
    const category = await tx.tipoProducto.upsert({ where: { nombre: 'Alimentos de demostración' }, update: {}, create: { nombre: 'Alimentos de demostración' } });
    const container = await tx.container.upsert({ where: { codigo: 'DEMO-C01' }, update: {}, create: { codigo: 'DEMO-C01', descripcion: 'Estante de demostración' } });
    await tx.container.upsert({ where: { codigo: 'DEMO-C02' }, update: {}, create: { codigo: 'DEMO-C02', descripcion: 'Contenedor inactivo', activo: false } });
    const lote = await tx.lote.upsert({ where: { codigo: 'DEMO-L01' }, update: {}, create: { codigo: 'DEMO-L01', fechaVencimiento: new Date('2028-12-31T12:00:00Z') } });
    await tx.lote.upsert({ where: { codigo: 'DEMO-L02' }, update: {}, create: { codigo: 'DEMO-L02', activo: false } });
    const client = await tx.cliente.upsert({ where: { codigo: 'DEMO-CLI01' }, update: {}, create: { codigo: 'DEMO-CLI01', nombre: 'Cliente de demostración', email: 'cliente@example.com', telefono: '12345678' } });
    await tx.cliente.upsert({ where: { codigo: 'DEMO-CLI02' }, update: {}, create: { codigo: 'DEMO-CLI02', nombre: 'Cliente inactivo de ejemplo', telefono: '12345678', activo: false } });
    const types = {};
    for (const tipo of ['ENTRADA', 'SALIDA']) types[tipo] = await tx.tipoMovimiento.upsert({ where: { codigo: `DEMO-${tipo}` }, update: {}, create: { codigo: `DEMO-${tipo}`, nombre: tipo === 'ENTRADA' ? 'Recepción de ejemplo' : 'Despacho de ejemplo', tipo } });
    for (const [index, name] of ['Arroz blanco 1 kg', 'Frijol negro 1 kg', 'Atún en lata 140 g', 'Agua purificada 1 litro', 'Avena en bolsa 500 g', 'Producto demo inactivo'].entries()) {
      const product = await tx.producto.upsert({ where: { codigo: `DEMO-P0${index + 1}` }, update: {}, create: { codigo: `DEMO-P0${index + 1}`, nombre: name, tipoProductoId: category.id, unidadMedida: 'Unidad', activo: index < 5 } });
      // Do not reset balances or recreate history for an already-used demo product.
      if (index >= 5 || await tx.kardex.count({ where: { bodegaId: warehouse.id, productoId: product.id } })) continue;
      const quantity = 100 + index * 20;
      const date = new Date(Date.now() - (5 - index) * 86400000);
      await tx.kardex.create({ data: { bodegaId: warehouse.id, productoId: product.id, containerId: container.id, loteId: lote.id, tipoMovimientoId: types.ENTRADA.id, fecha: date, cantidad: quantity, saldoAnterior: 0, saldoNuevo: quantity, observaciones: '[DEMO-NUBE] Entrada ficticia' } });
      await tx.kardex.create({ data: { bodegaId: warehouse.id, productoId: product.id, clienteId: client.id, tipoMovimientoId: types.SALIDA.id, fecha: new Date(date.getTime() + 3600000), cantidad: 20, saldoAnterior: quantity, saldoNuevo: quantity - 20, observaciones: '[DEMO-NUBE] Salida ficticia' } });
    }
  }, { isolationLevel: 'Serializable', timeout: 30000 });
}
async function main() {
  configuration(process.env);
  if (process.env.SEED_DEMO !== 'true') throw new Error('SEED_DEMO no está habilitado.');
  const db = new PrismaClient();
  try { await seedCloudDemo(db); console.log('Catálogos y movimientos ficticios preparados.'); }
  finally { await db.$disconnect(); }
}
if (require.main === module) main().catch(() => { console.error('Falló la carga demo. Revise la conexión y las migraciones.'); process.exitCode = 1; });
module.exports = { seedCloudDemo };
