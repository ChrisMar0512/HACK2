/**
 * Tipos estándar para manejo de respuestas y errores de la API Log Pose
 */

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  status: number;
  code:
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'TOKEN_EXPIRED'
    | 'INVALID_CREDENTIALS'
    | 'EMAIL_ALREADY_REGISTERED'
    | 'TEAM_NAME_TAKEN'
    | 'REGISTRATION_CLOSED'
    | 'INVALID_CURSOR'
    | 'CURSOR_FILTER_MISMATCH'
    | 'NOT_FOUND'
    | 'NEWS_ALREADY_VERIFIED'
    | 'LOG_POSE_REQUIRED'
    | 'RATE_LIMITED'
    | 'INTERNAL_ERROR'
    | 'SERVICE_UNAVAILABLE'
    | string;
  message: string;
  traceId: string;
  details?: ApiErrorDetail[];
  retryAfterSeconds?: number;
}
