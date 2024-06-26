import type { Spy } from '@std/testing/mock';
import { faker } from 'faker';
import { Hono } from 'hono';
import { LogRecord } from '@std/log/logger';
import { assertEquals, assertNotEquals } from '@std/assert';
import { afterEach, beforeAll, beforeEach, describe, it } from '@std/testing/bdd';
import { assertSpyCall, assertSpyCalls, spy } from '@std/testing/mock';
import { formatter, log, logger } from '~/middleware/logger.ts';
import { colorStatus, convertToMessage, formatArgs } from '~/util/message.ts';
import {
  createHttpArgs,
  createMessageOptions,
  createRandomArgs,
} from '~/tests/logger_utils.ts';

describe('Logger', () => {
  describe('Util', () => {
    describe('Convert to message', () => {
      it('without message', () => {
        const [msg, args] = convertToMessage(createMessageOptions());

        const [message, elapsed] = msg.split('- ');
        const time = Number.parseInt(elapsed);
        const unit = elapsed.slice(-2);

        assertEquals(message, '');
        assertNotEquals(time, NaN);
        assertEquals(unit, 'ms');
        assertEquals(typeof args[0], 'string');
        assertEquals(typeof args[1], 'string');
        assertEquals(typeof args[2], 'number');
      });

      it('with message', () => {
        const options = createMessageOptions();
        const message = faker.lorem.sentence();
        const [msg, _args] = convertToMessage({ ...options, message });

        const [m, _elapsed] = msg.split('- ');

        assertNotEquals(m, message);
      });
    });

    describe('Color status', () => {
      it('greened when http status is informational', () => {
        const status = faker.internet.httpStatusCode({
          types: ['informational'],
        });
        const colored = colorStatus(status);

        assertEquals(colored, `\x1b[32m${status}\x1b[39m`);
      });

      it('greened when http status is success', () => {
        const status = faker.internet.httpStatusCode({
          types: ['success'],
        });
        const colored = colorStatus(status);

        assertEquals(colored, `\x1b[32m${status}\x1b[39m`);
      });

      it('cyaned when http status is redirection', () => {
        const status = faker.internet.httpStatusCode({
          types: ['redirection'],
        });
        const colored = colorStatus(status);

        assertEquals(colored, `\x1b[36m${status}\x1b[39m`);
      });

      it('yellowed when http status is client error', () => {
        const status = faker.internet.httpStatusCode({
          types: ['clientError'],
        });
        const colored = colorStatus(status);

        assertEquals(colored, `\x1b[33m${status}\x1b[39m`);
      });

      it('reded when http status is server error', () => {
        const status = faker.internet.httpStatusCode({
          types: ['serverError'],
        });
        const colored = colorStatus(status);

        assertEquals(colored, `\x1b[31m${status}\x1b[39m`);
      });
    });

    describe('Format args', () => {
      it('return empty string when args is empty', () => {
        const args: unknown[] = [];
        const formatted = formatArgs(args);

        assertEquals(formatted, '');
      });

      it('return simple join string when args is not HttpArgs', () => {
        const args = createRandomArgs();
        const formatted = formatArgs(args);

        assertEquals(formatted, args.join(' '));
      });

      it('return colored join string when args is HttpArgs', () => {
        const args = createHttpArgs();
        const formatted = formatArgs(args);

        assertNotEquals(formatted, '');
        assertNotEquals(formatted, args.join(' '));
        assertEquals(formatted.split(' ')[2], colorStatus(args[2]));
      });
    });
  });

  describe('Formatter', () => {
    it('without message', () => {
      const [msg, args] = convertToMessage(createMessageOptions());
      const formatted = formatter(
        new LogRecord({ msg, args, level: 10, loggerName: 'default' }),
      ).split(' ');

      assertEquals(formatted[3], `[DEBUG]`);
      assertEquals(formatted[4], args[0]);
      assertEquals(formatted[5], args[1]);
      assertEquals(formatted[7], '-');
      assertEquals(formatted[8].slice(-2), 'ms');
    });

    it('with message', () => {
      const options = createMessageOptions();
      const message = faker.lorem.sentence();
      const [msg, args] = convertToMessage({ ...options, message });
      const formatted = formatter(
        new LogRecord({ msg, args, level: 10, loggerName: 'default' }),
      ).split(' ');

      assertNotEquals(formatted[7], '-');
      assertEquals(formatted[7], message.split(' ')[0]);
    });

    it('without args', () => {
      const options = createMessageOptions();
      const message = faker.word.sample();
      const [msg, _] = convertToMessage({ ...options, message });

      const formatted = formatter(
        new LogRecord({ msg, args: [], level: 10, loggerName: 'default' }),
      ).split(' ');

      assertEquals(formatted.length, 7);
    });
  });

  describe('Logger class', () => {
    it("log level is 'DEBUG' and logger name is 'default'", () => {
      const { level, levelName, loggerName } = log;

      assertEquals(level, 10);
      assertEquals(levelName, 'DEBUG');
      assertEquals(loggerName, 'default');
    });

    it('log formatter', () => {
      const msgOptions = createMessageOptions();
      const [msg, args] = convertToMessage(msgOptions);
      const { handlers, level, loggerName } = log;
      const logRecord = new LogRecord({ msg, args, level, loggerName });
      const formatted = handlers[0].format(logRecord);

      assertEquals(formatted, formatter(logRecord));
    });

    describe('logging', () => {
      let logSpy: Spy;
      let msg: string;

      beforeEach(() => {
        logSpy = spy(console, 'log');
        msg = faker.word.sample();
      });

      afterEach(() => {
        logSpy.restore();
      });

      it('debug', () => {
        const formatted = formatter(
          new LogRecord({ msg, args: [], level: 10, loggerName: 'default' }),
        );
        log.debug(msg);

        assertSpyCall(logSpy, 0, { args: [formatted] });
      });

      it('info', () => {
        const msg = faker.word.sample();
        const formatted = formatter(
          new LogRecord({ msg, args: [], level: 20, loggerName: 'default' }),
        );
        log.info(msg);

        assertSpyCall(logSpy, 0, { args: [`\x1b[34m${formatted}\x1b[39m`] });
      });

      it('warn', () => {
        const msg = faker.word.sample();
        const formatted = formatter(
          new LogRecord({ msg, args: [], level: 30, loggerName: 'default' }),
        );
        log.warn(msg);

        assertSpyCall(logSpy, 0, { args: [`\x1b[33m${formatted}\x1b[39m`] });
      });

      it('error', () => {
        const msg = faker.word.sample();
        const formatted = formatter(
          new LogRecord({ msg, args: [], level: 40, loggerName: 'default' }),
        );
        log.error(msg);

        assertSpyCall(logSpy, 0, { args: [`\x1b[31m${formatted}\x1b[39m`] });
      });

      it('critical', () => {
        const msg = faker.word.sample();
        const formatted = formatter(
          new LogRecord({ msg, args: [], level: 50, loggerName: 'default' }),
        );
        log.critical(msg);

        assertSpyCall(logSpy, 0, {
          args: [`\x1b[1m\x1b[31m${formatted}\x1b[39m\x1b[22m`],
        });
      });
    });
  });

  describe('Logger middleware', () => {
    let app: Hono;
    let logSpy: Spy;

    beforeAll(() => {
      app = new Hono();
      app.use('*', logger);
      app.get('/:text', (c) => {
        const text = c.req.param('text');
        if (text === 'json') return c.json({ message: text });
        return c.text(text);
      });
    });

    beforeEach(() => {
      logSpy = spy(console, 'log');
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
