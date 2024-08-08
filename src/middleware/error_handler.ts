import type { Context, ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { JoinJoaomgcd } from 'joinjoaomgcd';
import config from '~/config.ts';

const joinjoaomgcd = new JoinJoaomgcd(config.join.apiKey);

export const errorHandler: ErrorHandler = async (err, c) => {
  const message = err.message || 'Something is wrong';
  if (err instanceof HTTPException) {
    const res = err.getResponse();
    await sendErrorToDevice(c, message, res.status);
    return c.json({ message }, res);
  }
  await sendErrorToDevice(c, 'Internal Server Error', 500);
  return c.text('Internal Server Error', 500);
};

export const notFoundHandler: NotFoundHandler = async (c) => {
  const message = `Route(${c.req.path}) not found`;
  await sendErrorToDevice(c, message, 404);
  return c.json({ message }, 404);
};

async function sendErrorToDevice(c: Context, message: string, status: number) {
  const { method, path } = c.req;
  await joinjoaomgcd.sendPush({
    deviceId: config.join.deviceId,
    title: `unServer Error on ${method} ${path} ${status}`,
    text: message,
  });
}
