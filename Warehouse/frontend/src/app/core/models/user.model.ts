export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'OPERADOR' | 'SUPERVISOR';
  activo: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface AuditLog {
  id: number;
  userId: number;
  user?: User;
  accion: string;
  entidad: string;
  entidadId?: number;
  descripcion: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}