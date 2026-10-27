/**
 * Tipos de datos para el módulo de Autenticación (Auth)
 */

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Team {
  code: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: User;
  team: Team;
}

export interface MeResponse {
  user: User;
  team: Team;
  expiresAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  teamName: string;
  email: string;
  password: string;
}
