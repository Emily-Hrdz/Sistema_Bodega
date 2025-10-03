import { Test, TestingModule } from '@nestjs/testing';
import { BodegaDiferenciaController } from './bodega-diferencia.controller';

describe('BodegaDiferenciaController', () => {
  let controller: BodegaDiferenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BodegaDiferenciaController],
    }).compile();

    controller = module.get<BodegaDiferenciaController>(BodegaDiferenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
