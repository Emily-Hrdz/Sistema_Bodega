import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import request = require('supertest');
import { jwtSettings } from './auth/jwt-settings';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { ContainerController } from './container/container.controller';
import { ContainerService } from './container/container.service';
import { TipoProductoController } from './tipo-producto/tipo-producto.controller';
import { TipoProductoService } from './tipo-producto/tipo-producto.service';
import { BodegaDiferenciaController } from './bodega-diferencia/bodega-diferencia.controller';
import { BodegaDiferenciaService } from './bodega-diferencia/bodega-diferencia.service';
import { AuditLogController } from './audit-log/audit-log.controller';
import { AuditLogService } from './audit-log/audit-log.service';
import { KardexController } from './kardex/kardex.controller';
import { KardexService } from './kardex/kardex.service';
import { HealthController } from './health.controller';

const secret = 'test-only-secret-not-for-deployment-0000';
const { configuration } = require('../scripts/start-render.cjs');
const { normalizeCloudSeed, seedCloudDemo } = require('../scripts/seed-cloud-demo.cjs');

describe('Carga ficticia sin conexión a base real', () => {
  it('renombra registros anteriores sin cambiar IDs ni movimientos relacionados', async () => {
    const records: any = {
      bodega: [{ id: 4, nombre: 'Bodega demo Amatitlan', ubicacion: 'Amatitlan, Guatemala (demostración)' }],
      tipoProducto: [], container: [], lote: [], cliente: [], tipoMovimiento: [], producto: [],
    };
    const tx: any = {};
    for (const name of Object.keys(records)) {
      tx[name] = {
        findUnique: async ({ where }) => records[name].find(record => Object.entries(where).every(([key, value]) => record[key] === value)) ?? null,
        update: async ({ where, data }) => Object.assign(records[name].find(record => record.id === where.id), data),
      };
    }
    const movements = [{ bodegaId: 4, observaciones: '[DEMO-NUBE] Entrada ficticia' }];
    tx.kardex = { updateMany: async ({ where, data }) => movements.filter(m => m.observaciones === where.observaciones).forEach(m => Object.assign(m, data)) };
    const db = { $transaction: async callback => callback(tx) };
    await normalizeCloudSeed(db);
    await normalizeCloudSeed(db);
    expect(records.bodega).toEqual([{ id: 4, nombre: 'Bodega 1 Amatitlán', ubicacion: 'Amatitlán, Guatemala' }]);
    expect(movements).toEqual([{ bodegaId: 4, observaciones: 'Recepción de mercancía' }]);
  });
  it('crea ejemplos y no duplica movimientos ni sobrescribe catálogos al repetir', async () => {
    const movements: any[] = [];
    const tx: any = {};
    for (const name of ['bodega', 'tipoProducto', 'container', 'lote', 'cliente', 'tipoMovimiento', 'producto']) {
      const records = new Map();
      tx[name] = { upsert: jest.fn(async ({ where, create, update }) => {
        expect(update).toEqual({});
        const key = JSON.stringify(where);
        if (!records.has(key)) records.set(key, { id: records.size + 1, ...create });
        return records.get(key);
      }) };
    }
    tx.kardex = {
      count: async ({ where }) => movements.filter(m => m.bodegaId === where.bodegaId && m.productoId === where.productoId).length,
      create: async ({ data }) => { movements.push(data); return data; },
    };
    const db = { $transaction: async callback => callback(tx) };
    await seedCloudDemo(db);
    expect(movements).toHaveLength(10);
    expect(movements.every(m => m.saldoNuevo >= 0)).toBe(true);
    await seedCloudDemo(db);
    expect(movements).toHaveLength(10);
  });
});

describe('Configuración de publicación (sin base de datos)', () => {
  it('exige secreto robusto en producción', () => {
    expect(() => jwtSettings(new ConfigService({ NODE_ENV: 'production', JWT_SECRET: 'short' }))).toThrow();
    expect(jwtSettings(new ConfigService({ NODE_ENV: 'production', JWT_SECRET: secret, JWT_EXPIRES_IN: '7d' })).expiresIn).toBe(604800);
  });
  it('rechaza duración inválida', () => {
    expect(() => jwtSettings(new ConfigService({ JWT_EXPIRES_IN: '0d' }))).toThrow();
    expect(() => jwtSettings(new ConfigService({ JWT_EXPIRES_IN: 'bad' }))).toThrow();
  });
  it('impide ejecutar el arranque Render contra una base local', () => {
    expect(() => configuration({})).toThrow();
    expect(() => configuration({ RENDER: 'true', JWT_SECRET: secret, DATABASE_URL: 'postgresql://example:example@localhost:5433/demo' })).toThrow();
  });
  it('usa conexión directa en migraciones y conserva la agrupada para el servidor', () => {
    const url = 'postgresql://example:example@ep-example-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const config = configuration({ RENDER: 'true', JWT_SECRET: secret, DATABASE_URL: url });
    expect(config.DATABASE_URL).toBe(url);
    expect(config.DIRECT_DATABASE_URL).not.toContain('-pooler.');
    expect(config.DIRECT_DATABASE_URL).toContain('sslmode=require');
    expect(config.NODE_ENV).toBe('production');
  });
});

describe('API demo con persistencia simulada', () => {
  let app: any;
  let jwt: JwtService;
  const audit = { findAll: jest.fn(() => []), findByUser: jest.fn(() => []), findByEntity: jest.fn(() => []) };
  const list = { findAll: () => [], create: (value: any) => value };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret })],
      controllers: [HealthController, UsersController, ContainerController, TipoProductoController, BodegaDiferenciaController, AuditLogController, KardexController],
      providers: [JwtStrategy,
        { provide: ConfigService, useValue: new ConfigService({ JWT_SECRET: secret, NODE_ENV: 'production' }) },
        { provide: UsersService, useValue: { findOne: async (id: number) => ({ id, activo: id !== 3, rol: id === 2 ? 'ADMIN' : 'OPERADOR' }), findAll: () => [] } },
        { provide: ContainerService, useValue: list }, { provide: TipoProductoService, useValue: list },
        { provide: BodegaDiferenciaService, useValue: list }, { provide: AuditLogService, useValue: audit },
        { provide: KardexService, useValue: list },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init(); jwt = module.get(JwtService);
  });
  afterAll(async () => { await app?.close(); });
  it('publica health sin credenciales', async () => {
    const result = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(result.body.status).toBe('ok');
  });
  it.each(['/api/containers', '/api/tipos-productos', '/api/bodegas-diferencias', '/api/users', '/api/kardex', '/api/audit-logs'])('rechaza anónimo en %s', async path => {
    await request(app.getHttpServer()).get(path).expect(401);
  });
  it('permite consulta autenticada de contenedores', async () => {
    await request(app.getHttpServer()).get('/api/containers').auth(jwt.sign({ sub: 1 }), { type: 'bearer' }).expect(200);
  });
  it('no permite que un OPERADOR gestione usuarios aunque su token tenga un rol anterior', async () => {
    await request(app.getHttpServer()).get('/api/users').auth(jwt.sign({ sub: 1, rol: 'ADMIN' }), { type: 'bearer' }).expect(403);
    await request(app.getHttpServer()).get('/api/users').auth(jwt.sign({ sub: 2 }), { type: 'bearer' }).expect(200);
  });
  it('rechaza usuarios inactivos y tokens vencidos', async () => {
    await request(app.getHttpServer()).get('/api/containers').auth(jwt.sign({ sub: 3 }), { type: 'bearer' }).expect(401);
    await request(app.getHttpServer()).get('/api/containers').auth(jwt.sign({ sub: 1 }, { expiresIn: -1 }), { type: 'bearer' }).expect(401);
  });
  it('admite auditoría sin limit y obtiene userId desde la ruta', async () => {
    const token = jwt.sign({ sub: 1 });
    await request(app.getHttpServer()).get('/api/audit-logs').auth(token, { type: 'bearer' }).expect(200);
    expect(audit.findAll).toHaveBeenCalledWith(100);
    await request(app.getHttpServer()).get('/api/audit-logs/user/8').auth(token, { type: 'bearer' }).expect(200);
    expect(audit.findByUser).toHaveBeenCalledWith(8, 50);
  });
  it.each([0, -1])('rechaza cantidad %s en Kardex', async cantidad => {
    await request(app.getHttpServer()).post('/api/kardex').auth(jwt.sign({ sub: 1 }), { type: 'bearer' })
      .send({ bodegaId: 1, productoId: 1, tipoMovimientoId: 1, cantidad }).expect(400);
  });
});
