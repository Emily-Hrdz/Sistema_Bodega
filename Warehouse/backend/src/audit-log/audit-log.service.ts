import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async create(createAuditLogDto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: createAuditLogDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
          },
        },
      },
    });
  }

  async findAll(limit: number = 100) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
          },
        },
      },
    });
  }

  async findByUser(userId: number, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
          },
        },
      },
    });
  }

  async findByEntity(entidad: string, entidadId: number) {
    return this.prisma.auditLog.findMany({
      where: { entidad, entidadId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true,
          },
        },
      },
    });
  }
}