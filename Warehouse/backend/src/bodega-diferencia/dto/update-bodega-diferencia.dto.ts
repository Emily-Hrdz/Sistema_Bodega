import { PartialType } from '@nestjs/mapped-types';
import { CreateBodegaDiferenciaDto } from './create-bodega-diferencia.dto';

export class UpdateBodegaDiferenciaDto extends PartialType(CreateBodegaDiferenciaDto) {}