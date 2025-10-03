import { Test, TestingModule } from '@nestjs/testing';
import { TipoMovimientoController } from './tipo-movimiento.controller';

describe('TipoMovimientoController', () => {
  let controller: TipoMovimientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoMovimientoController],
    }).compile();

    controller = module.get<TipoMovimientoController>(TipoMovimientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
