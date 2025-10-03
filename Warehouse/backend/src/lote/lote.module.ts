import { Module } from '@nestjs/common';
import { LoteController } from './lote.controller';
import { LoteService } from './lote.service';

@Module({
  controllers: [LoteController],
  providers: [LoteService]
})
export class LoteModule {}
