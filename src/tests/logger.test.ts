import type { Spy } from '@std/testing/mock';
import { faker } from 'faker';
import { Hono } from 'hono';
import { assertEquals, assertGreater, assertNotEquals } from '@std/assert';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';
import { assertSpyCalls, spy } from '@std/testing/mock';
import { logger } from '~/middleware/logger.ts';
import { colorLog, colorStatus, formatMsg, formatter } from '~/util/logger.ts';
import { createLogRecord, createMessageOptions } from '~/tests/logger_utils.ts';

describe('Logger', () => {
  describe('Util', () => {
    describe('Colorize message', () => {
      it('blued when log level is `INFO`', () => {
        const msg = faker.lorem.sentence();
        const colorized = colorLog('info', msg);

        assertEquals(colorized, `\x1b[34m${msg}\x1b[39m`);
      });
      it('nothing when log level is `DEBUG`', () => {
        const msg = faker.lorem.sentence();
        const colorized = colorLog('debug', msg);

        assertEquals(colorized, msg);
      });
      it('yellowed when log level is `WARN`', () => {
        const msg = faker.lorem.sentence();
        const colorized = colorLog('warning', msg);

        assertEquals(colorized, `\x1b[33m${msg}\x1b[39m`);
      });
      it('reded when log level is `ERROR`', () => {
        const msg = faker.lorem.sentence();
        const colorized = colorLog('error', msg);

        assertEquals(colorized, `\x1b[31m${msg}\x1b[39m`);
      });
      it('bold and reded when log level is `FATAL`', () => {
        const msg = faker.lorem.sentence();
        const colorized = colorLog('fatal', msg);

        assertEquals(colorized, `\x1b[1m\x1b[31m${msg}\x1b[39m\x1b[22m`);
      });
    });

    describe('Color status', () => {
      it('greened when http status is informational', () => {
        const status = faker.internet.httpStatusCode({
          types: ['informational'],
        });
        const colorized = colorStatus(status);

        assertEquals(colorized, `\x1b[32m${status}\x1b[39m`);
      });

      it('greened when http status is success', () => {
        const status = faker.internet.httpStatusCode({
          types: ['success'],
        });
        const colorized = colorStatus(status);

        assertEquals(colorized, `\x1b[32m${status}\x1b[39m`);
      });

      it('cyaned when http status is redirection', () => {
        const status = faker.internet.httpStatusCode({
          types: ['redirection'],
        });
        const colorized = colorStatus(status);

        assertEquals(colorized, `\x1b[36m${status}\x1b[39m`);
      });

      it('yellowed when http status is client error', () => {
        const status = faker.internet.httpStatusCode({
          types: ['clientError'],
        });
        const colorized = colorStatus(status);

        assertEquals(colorized, `\x1b[33m${status}\x1b[39m`);
      });

      it('reded when http status is server error', () => {
        const status = faker.internet.httpStatusCode({
          types: ['serverError'],
        });
        const colorized = colorStatus(status);

        assertEquals(colorized, `\x1b[31m${status}\x1b[39m`);
      });
    });

    describe('Format message', () => {
      it('return empty string when options is empty', () => {
        const options = {};
        const formatted = formatMsg(options);

        assertEquals(formatted, '');
      });

      it('return elapsed when options has only start', () => {
        const options = { start: Date.now() };
        const formatted = formatMsg(options).split(' ');

        assertEquals(formatted.length, 2);
        assertNotEquals(parseInt(formatted[1]), NaN);
        assertEquals(formatted[1].slice(-2), 'ms');
      });

      it('return formatted string without message', () => {
        const options = createMessageOptions();
        const formatted = formatMsg(options).split(' ');

        assertEquals(formatted.length, 5);
        assertEquals(formatted[0], options.method);
        assertEquals(formatted[1], options.path);
        assertEquals(formatted[2], colorStatus(options.status));
        assertNotEquals(Number.parseInt(formatted[4]), NaN);
        assertEquals(formatted[4].slice(-2), 'ms');
      });

      it('return formatted string with message', () => {
        const options = createMessageOptions();
        const message = faker.lorem.sentence();
        const formatted = formatMsg({ ...options, message }).split(' ');
        const formattedMessage = formatted
          .filter((_, index) =>
            index !== 0 && index !== 1 && index !== 2 &&
            index !== formatted.length - 1 &&
            index !== formatted.length - 2
          )
          .join(' ');

        assertGreater(formatted.length, 5);
        assertEquals(Number.parseInt(formatted[4]), NaN);
        assertEquals(formattedMessage, message);
      });
    });
  });

  describe('Formatter', () => {
    it('General log without start', () => {
      const msg = faker.word.sample();
      const record = createLogRecord({ message: [msg] });
      const formatted = formatter(record)[0].split(' ');

      assertEquals(formatted[0].split('/').length, 3);
      assertEquals(formatted[1].split(':').length, 3);
      assertEquals(formatted[2], 'GMT+9');
      assertEquals(formatted[3], `[${record.level.toUpperCase()}]`);
      assertEquals(formatted[4], msg);
    });

    it('General log with start', () => {
      const msg = faker.word.sample();
      const start = Date.now();
      const record = createLogRecord({
        level: 'debug',
        message: [msg],
        properties: { start },
      });
      const formatted = formatter(record)[0].split(' ');

      assertEquals(formatted[5], '-');
      assertEquals(formatted[6].slice(-2), 'ms');
    });

    it('Router Log without message', () => {
      const options = createMessageOptions();
      const record = createLogRecord({ level: 'debug', properties: options });
      const formatted = formatter(record)[0].split(' ');

      assertEquals(formatted[4], options.method);
      assertEquals(formatted[5], options.path);
      assertEquals(formatted[6], colorStatus(options.status));
      assertEquals(formatted[7], '-');
      assertEquals(formatted[8].slice(-2), 'ms');
    });

    it('with message', () => {
      const options = createMessageOptions();
      const message = faker.word.sample();
      const record = createLogRecord({ properties: { ...options, message } });
      const formatted = formatter(record)[0].split(' ');

      assertNotEquals(formatted[7], '-');
      assertEquals(formatted[7], message);
    });
  });

  describe('Logger middleware', () => {
    let logSpy: Spy;
    const app = new Hono()
      .use('*', logger)
      .get('/', (c) => {
        return c.text('Hello');
      })
      .get('/:text', (c) => {
        const text = c.req.param('text');
        if (text === 'json') return c.json({ message: text });
        return c.text(text);
      });

    beforeEach(() => {
      logSpy = spy(console, 'debug');
    });

    afterEach(() => {
      logSpy.restore();
    });

    it('counts logger calls', async () => {
      let cnt = 0;
      while (cnt++ < Math.floor(Math.random() * 5) + 1) {
        await app.request('/', { method: 'get' });
      }

      assertSpyCalls(logSpy, cnt - 1);
    });

    it('checks content type', async () => {
      const text = await app.request('/text', { method: 'get' });
      const json = await app.request('/json', { method: 'get' });

      assertEquals(text.status, 200);
      assertEquals(json.status, 200);

      assertSpyCalls(logSpy, 2);
      const textArgs = (logSpy.calls[0].args[0] as string).split(' ');
      const jsonArgs = (logSpy.calls[1].args[0] as string).split(' ');

      assertEquals(
        text.headers.get('Content-Type')?.includes('application/json'),
        false,
      );
      assertEquals(textArgs.length, 9);

      assertEquals(
        json.headers.get('Content-Type')?.includes('application/json'),
        true,
      );
      assertEquals(jsonArgs.length, 10);
    });
  });
});
