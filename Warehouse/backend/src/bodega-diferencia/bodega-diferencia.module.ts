import { Module } from '@nestjs/common';
import { BodegaDiferenciaController } from './bodega-diferencia.controller';
import { BodegaDiferenciaService } from './bodega-diferencia.service';

@Module({
  controllers: [BodegaDiferenciaController],
  providers: [BodegaDiferenciaService]
})
export class BodegaDiferenciaModule {}
