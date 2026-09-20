export const API_ERROR_CODES = [
  "invalid_request",
  "unauthorized",
  "forbidden",
  "wrong_product_key",
  "quota_exceeded",
  "rate_limited",
  "unknown_entity",
  "unsupported_operation",
  "partner_unavailable",
  "offer_unavailable",
  "internal_error",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    request_id: string;
    details?: Record<string, unknown>;
  };
};

export const API_ERROR_STATUS: Record<ApiErrorCode, number> = {
  invalid_request: 400,
  unauthorized: 401,
  forbidden: 403,
  wrong_product_key: 403,
  quota_exceeded: 429,
  rate_limited: 429,
  unknown_entity: 404,
  unsupported_operation: 409,
  partner_unavailable: 409,
  offer_unavailable: 409,
  internal_error: 500,
};

export function apiError(
  code: ApiErrorCode,
  message: string,
  requestId: string,
  details?: Record<string, unknown>,
): { status: number; body: ApiErrorBody } {
  return {
    status: API_ERROR_STATUS[code],
    body: { error: { code, message, request_id: requestId, details } },
  };
}

export function newRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
