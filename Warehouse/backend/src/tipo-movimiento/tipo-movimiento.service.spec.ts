import { Test, TestingModule } from '@nestjs/testing';
import { TipoMovimientoService } from './tipo-movimiento.service';

describe('TipoMovimientoService', () => {
  let service: TipoMovimientoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoMovimientoService],
    }).compile();

    service = module.get<TipoMovimientoService>(TipoMovimientoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
