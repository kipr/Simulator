interface Error {
  type: 'db-error';
  code: number;
  message?: string;
}

namespace Error {
  export const CODE_NOT_AUTHORIZED = 401;
  export const CODE_FORBIDDEN = 403;
  export const CODE_NOT_FOUND = 404;
  export const CODE_INTERNAL = 500;
  export const CODE_SERVICE_UNAVAILABLE = 503;

  export const is = (error: unknown): error is Error => (
    error &&
    typeof error === 'object' &&
    'type' in error &&
    typeof error['type'] === 'string' &&
    error['type'] === 'db-error'
  );
}

export default Error;