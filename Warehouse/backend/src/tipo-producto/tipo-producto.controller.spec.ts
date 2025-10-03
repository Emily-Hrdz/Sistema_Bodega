import { Test, TestingModule } from '@nestjs/testing';
import { TipoProductoController } from './tipo-producto.controller';

describe('TipoProductoController', () => {
  let controller: TipoProductoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoProductoController],
    }).compile();

    controller = module.get<TipoProductoController>(TipoProductoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
