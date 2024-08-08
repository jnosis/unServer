import type { StatusCode } from 'hono/utils/http-status';
import { HTTPException } from 'hono/http-exception';

export const throwError = (status: StatusCode, message: string) => {
  throw new HTTPException(status, { message });
};
