// Run after npm run build: node --env-file=.env scripts/verify-catalog-deletion.cjs
// All test records are rolled back, including when an assertion fails.
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const rollback = new Error('ROLLBACK_TEST_DATA');

async function main() {
  try {
    await prisma.$transaction(async tx => {
      const prefix = `test-${Date.now()}`;
      const type = await tx.tipoProducto.create({ data: { nombre: prefix } });
      const specs = [
        ['bodega', 'Bodega', { nombre: prefix }],
        ['producto', 'Producto', { codigo: prefix, nombre: prefix, tipoProductoId: type.id, unidadMedida: 'Unidad' }],
        ['container', 'Container', { codigo: prefix }],
        ['lote', 'Lote', { codigo: prefix }],
        ['cliente', 'Cliente', { codigo: prefix, nombre: prefix }],
      ];
      const services = {};
      const records = {};
      // Use the real database delegates inside one rollback-only test transaction.
      const adapter = new Proxy(tx, {
        get(target, key) {
          return key === '$transaction' ? callback => callback(tx) : target[key];
        },
      });
      for (const [model, name, data] of specs) {
        const Service = require(`../dist/${model}/${model}.service.js`)[`${name}Service`];
        const service = services[model] = new Service(adapter);
        const record = await tx[model].create({ data });
        await service.remove(record.id);
        assert.equal(await tx[model].findUnique({ where: { id: record.id } }), null);
        records[model] = await tx[model].create({ data });
      }
      const movement = await tx.tipoMovimiento.create({ data: { codigo: prefix.slice(-20), nombre: prefix, tipo: 'ENTRADA' } });
      const entry = await tx.kardex.create({ data: {
        bodegaId: records.bodega.id, productoId: records.producto.id,
        containerId: records.container.id, loteId: records.lote.id,
        clienteId: records.cliente.id, tipoMovimientoId: movement.id,
        cantidad: 1, saldoAnterior: 0, saldoNuevo: 1,
      } });
      for (const [model] of specs) {
        await assert.rejects(() => services[model].remove(records[model].id), error => error.getStatus?.() === 409);
        assert.ok(await tx[model].findUnique({ where: { id: records[model].id } }));
      }
      const preserved = await tx.kardex.findUnique({ where: { id: entry.id } });
      assert.equal(preserved.containerId, records.container.id);
      assert.equal(preserved.loteId, records.lote.id);
      assert.equal(preserved.clienteId, records.cliente.id);
      await tx.kardex.delete({ where: { id: entry.id } });
      await tx.bodegaDiferencia.create({ data: {
        bodegaId: records.bodega.id, productoId: records.producto.id,
        cantidadSistema: 1, cantidadFisica: 1, diferencia: 0, fechaConteo: new Date(),
      } });
      for (const model of ['bodega', 'producto']) {
        await assert.rejects(() => services[model].remove(records[model].id), error => error.getStatus?.() === 409);
      }
      throw rollback;
    }, { isolationLevel: 'Serializable', timeout: 20000 });
  } catch (error) {
    if (error !== rollback) throw error;
  }
  console.log('PASS: deletion of 5 unused catalogs; protection of movements and counts; test data rolled back.');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
