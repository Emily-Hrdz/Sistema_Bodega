import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ContainerService } from './container.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/containers')
@UseGuards(JwtAuthGuard)
export class ContainerController {
  constructor(private readonly containerService: ContainerService) {}

  @Post()
  create(@Body() createContainerDto: CreateContainerDto) {
    return this.containerService.create(createContainerDto);
  }

  @Get()
  findAll() {
    return this.containerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.containerService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContainerDto: UpdateContainerDto,
  ) {
    return this.containerService.update(id, updateContainerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.containerService.remove(id);
  }
}
