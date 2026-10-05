// node --env-file=.env scripts/seed-inventory-demo.cjs
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const results = await p.$transaction(async tx => {
    const types = {};
    for (const tipo of ['ENTRADA', 'SALIDA']) {
      types[tipo] = await tx.tipoMovimiento.upsert({
        where: { codigo: `DEMO-${tipo}` }, update: {},
        create: { codigo: `DEMO-${tipo}`, nombre: tipo === 'ENTRADA' ? 'Recepción de mercancía' : 'Despacho a cliente', tipo, descripcion: 'Tipo de movimiento para demostración.' },
      });
    }
    const bodegas = await tx.bodega.findMany({ where: { activo: true }, orderBy: { id: 'asc' } });
    const products = await tx.producto.findMany({ where: { activo: true }, orderBy: { id: 'asc' }, take: 5 });
    const container = await tx.container.findFirst({ where: { activo: true }, orderBy: { id: 'asc' } });
    const lote = await tx.lote.findFirst({ where: { activo: true, fechaVencimiento: { gt: new Date() } }, orderBy: { id: 'asc' } });
    const cliente = await tx.cliente.findFirst({ where: { activo: true }, orderBy: { id: 'asc' } });
    if (!bodegas.length || !products.length) throw new Error('Se requieren bodegas y productos activos.');
    const results = [];
    for (const [index, product] of products.entries()) {
      const bodega = bodegas[index % bodegas.length];
      const marker = `[DEMO-INVENTARIO-2026] ${product.codigo}`;
      if (await tx.kardex.findFirst({ where: { observaciones: { startsWith: marker } } })) continue;
      const latest = await tx.kardex.findFirst({ where: { bodegaId: bodega.id, productoId: product.id }, orderBy: [{ fecha: 'desc' }, { id: 'desc' }] });
      let saldo = latest ? Number(latest.saldoNuevo) : 0;
      const start = Math.max(Date.now() - (6 - index) * 86400000, latest ? latest.fecha.getTime() + 1000 : 0);
      for (const [step, tipo, cantidad] of [[0, 'ENTRADA', 100 + index * 20], [1, 'SALIDA', 20 + index * 5]]) {
        const saldoNuevo = saldo + (tipo === 'ENTRADA' ? cantidad : -cantidad);
        await tx.kardex.create({ data: {
          bodegaId: bodega.id, productoId: product.id,
          containerId: container?.id, loteId: lote?.id,
          clienteId: tipo === 'SALIDA' ? cliente?.id : undefined,
          tipoMovimientoId: types[tipo].id, cantidad,
          saldoAnterior: saldo, saldoNuevo, fecha: new Date(start + step * 3600000),
          observaciones: `${marker}: ${tipo === 'ENTRADA' ? 'recepción' : 'despacho'} de ejemplo.`,
        } });
        saldo = saldoNuevo;
      }
      if (index === 0 && !(await tx.bodegaDiferencia.count())) {
        await tx.bodegaDiferencia.create({ data: {
          bodegaId: bodega.id, productoId: product.id, cantidadSistema: saldo,
          cantidadFisica: saldo - 2, diferencia: -2, fechaConteo: new Date(),
          observaciones: 'Conteo de demostración: faltan 2 unidades. Pendiente de revisión, sin ajuste de inventario.',
        } });
      }
      results.push({ producto: product.codigo, bodega: bodega.nombre, saldo, unidad: product.unidadMedida });
    }
    return results;
  }, { isolationLevel: 'Serializable', timeout: 30000 });
  console.log(JSON.stringify(results, null, 2));
}
main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => p.$disconnect());
