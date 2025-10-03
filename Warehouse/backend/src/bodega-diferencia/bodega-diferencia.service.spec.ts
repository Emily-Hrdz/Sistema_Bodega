import { Test, TestingModule } from '@nestjs/testing';
import { BodegaDiferenciaService } from './bodega-diferencia.service';

describe('BodegaDiferenciaService', () => {
  let service: BodegaDiferenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BodegaDiferenciaService],
    }).compile();

    service = module.get<BodegaDiferenciaService>(BodegaDiferenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
