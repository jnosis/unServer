import { ConsoleHandler, getLogger, setup } from '$std/log/mod.ts';

setup({
  handlers: {
    functionFmt: new ConsoleHandler('DEBUG', {
      formatter: (logRecord) => {
        const time = logRecord.datetime.toLocaleString('en', {
          hour12: false,
          timeZone: 'Asia/Seoul',
          timeZoneName: 'short',
        });
        const args = logRecord.args.length > 0
          ? `${logRecord.args.join(' ')} `
          : '';
        return `${time} [${logRecord.levelName}] ${args}${logRecord.msg}`;
      },
    }),
  },

  loggers: {
    default: {
      level: 'DEBUG',
      handlers: ['functionFmt'],
    },
  },
});

const loggerMiddleware = getLogger();

export default loggerMiddleware;
