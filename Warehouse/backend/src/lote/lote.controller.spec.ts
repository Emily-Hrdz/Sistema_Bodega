import { Test, TestingModule } from '@nestjs/testing';
import { LoteController } from './lote.controller';

describe('LoteController', () => {
  let controller: LoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoteController],
    }).compile();

    controller = module.get<LoteController>(LoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
