import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { BodegaModule } from './bodega/bodega.module';
import { ProductoModule } from './producto/producto.module';
import { TipoProductoModule } from './tipo-producto/tipo-producto.module';
import { ContainerModule } from './container/container.module';
import { LoteModule } from './lote/lote.module';
import { ClienteModule } from './cliente/cliente.module';
import { TipoMovimientoModule } from './tipo-movimiento/tipo-movimiento.module';
import { KardexModule } from './kardex/kardex.module';
import { BodegaDiferenciaModule } from './bodega-diferencia/bodega-diferencia.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AuditLogModule,
    BodegaModule,
    ProductoModule,
    TipoProductoModule,
    ContainerModule,
    LoteModule,
    ClienteModule,
    TipoMovimientoModule,
    KardexModule,
    BodegaDiferenciaModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}