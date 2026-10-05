import { ConfigService } from '@nestjs/config';

export function jwtSettings(config: ConfigService) {
  const secret = config.get<string>('JWT_SECRET');
  if (config.get<string>('NODE_ENV') === 'production' && (!secret || secret.length < 32)) {
    throw new Error('En producción JWT_SECRET debe tener al menos 32 caracteres.');
  }
  const duration = config.get<string>('JWT_EXPIRES_IN') || '7d';
  const match = /^(\d+)(s|m|h|d)$/.exec(duration);
  if (!match) throw new Error('JWT_EXPIRES_IN debe usar un formato como 30m, 12h o 7d.');
  const units = { s: 1, m: 60, h: 3600, d: 86400 };
  const seconds = Number(match[1]) * units[match[2] as keyof typeof units];
  if (!Number.isSafeInteger(seconds) || seconds <= 0) throw new Error('Duración JWT inválida.');
  return { secret: secret || 'tu_secreto_super_seguro', expiresIn: seconds };
}
