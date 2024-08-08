import type { Spy } from '@std/testing/mock';
import { faker } from 'faker';
import { Hono } from 'hono';
import { assertEquals, assertGreater, assertNotEquals } from '@std/assert';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';
import { assertSpyCalls, spy } from '@std/testing/mock';
import {
  errorHandler,
  notFoundHandler,
  throwError,
} from '~/middleware/error_handler.ts';
import { logger } from '~/middleware/logger.ts';
import {
  colorLog,
  colorStatus,
  formatMsg,
  formatter,
  getKvSink,
  recordKv,
} from '~/util/logger.ts';
import {
  createLogRecord,
  createMessageOptions,
  initRecordKv,
} from '~/tests/logger_utils.ts';

type RecordMessage = { message: string; error: Error };

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

  describe('Kv Sink', () => {
    beforeEach(async () => {
      await initRecordKv();
    });

    it('writes record on deno kv', async () => {
      const sink = getKvSink();
      const error = new Error('ERROR');
      const record = createLogRecord({ level: 'error', properties: { error } });
      sink(record);
      const { value } = await recordKv.get<RecordMessage>([
        'record',
        'error',
        record.timestamp,
      ]);

      assertEquals(value?.message, formatter(record)[0] + '\n\t');
      assertEquals(value?.error, error);
    });

    it('writes record on deno kv with path', async () => {
      const sink = getKvSink();
      const options = createMessageOptions();
      const error = new Error('ERROR');
      const record = createLogRecord({
        level: 'error',
        properties: { ...options, error },
      });
      sink(record);
      const { value } = await recordKv.get<RecordMessage>([
        'record',
        'error',
        options.path,
        record.timestamp,
      ]);
      const { message, error: recordedError } = value!;

      assertEquals(message.split('-')[0], formatter(record)[0].split('-')[0]);
      assertEquals(message.endsWith('\n\t'), true);
      assertEquals(recordedError, error);
    });
  });

  describe('Logger middleware', () => {
    let logSpy: Spy;
    const app = new Hono()
      .use('*', logger)
      .notFound(notFoundHandler)
      .onError(errorHandler)
      .get('/', (c) => {
        return c.text('Hello');
      })
      .get('/route/text', (c) => {
        return c.text('text');
      })
      .get('/route/json', (c) => {
        return c.json({ message: 'json' });
      })
      .get('/error/:error', (c) => {
        const error = c.req.param('error');
        return error === 'notfound' ? c.notFound() : throwError(500, error);
      });

    beforeEach(async () => {
      logSpy = spy(console, 'debug');
      await initRecordKv();
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
      const text = await app.request('route/text', { method: 'get' });
      const json = await app.request('route/json', { method: 'get' });

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

    it('records error when not found', async () => {
      await app.request('/error/notfound', { method: 'get' });

      const entries = recordKv.list<RecordMessage>({
        prefix: ['record', 'error'],
      });

      for await (const entry of entries) {
        const { message, error } = entry.value;
        assertEquals(message.endsWith('\n\t'), true);
        assertEquals(error.message, 'not found');
      }
    });

    it('records error when error has occurred', async () => {
      let cnt = 0;
      let errors: string[] = [];
      while (cnt < Math.floor(Math.random() * 5) + 1) {
        const error = faker.word.sample();
        errors = [...errors, error];
        await app.request(`/error/${error}`, { method: 'get' });
        cnt++;
      }

      const entries = recordKv.list<RecordMessage>({
        prefix: ['record', 'error'],
      });

      let length = 0;
      for await (const entry of entries) {
        const { message, error } = entry.value;
        assertEquals(message.endsWith('\n\t'), true);
        assertEquals(errors.includes(error.message), true);
        length++;
      }
      assertEquals(length, cnt);
    });
  });
});
