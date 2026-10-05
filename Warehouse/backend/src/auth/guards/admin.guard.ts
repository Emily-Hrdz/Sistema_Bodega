import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (context.switchToHttp().getRequest().user?.rol !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede gestionar usuarios.');
    }
    return true;
  }
}
