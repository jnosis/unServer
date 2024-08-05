import type { LogLevel, LogRecord } from 'logtape';
import { faker } from 'faker';

type MessageOptions = {
  method: string;
  path: string;
  status: number;
  start: number;
  message?: string;
};

export function createMessageOptions(): MessageOptions {
  return {
    method: faker.internet.httpMethod(),
    path: faker.system.directoryPath(),
    status: faker.internet.httpStatusCode(),
    start: Date.now(),
  };
}

type LogRecordOptions = Partial<LogRecord>;

export function createLogRecord(options?: LogRecordOptions): LogRecord {
  return {
    category: options?.category ?? [''],
    level: options?.level ?? randomLogLevel(),
    message: options?.message ?? [],
    properties: options?.properties ?? {},
    timestamp: options?.timestamp ?? Date.now(),
  };
}

function randomLogLevel(): LogLevel {
  const level: { [key: string]: LogLevel } = {
    0: 'debug',
    1: 'info',
    2: 'warning',
    3: 'error',
    4: 'fatal',
  };
  return level[Math.floor(Math.random() * 4)];
}
