import { Module } from '@nestjs/common';
import { TipoProductoController } from './tipo-producto.controller';
import { TipoProductoService } from './tipo-producto.service';

@Module({
  controllers: [TipoProductoController],
  providers: [TipoProductoService]
})
export class TipoProductoModule {}
