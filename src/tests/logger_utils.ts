import type { HttpArgs } from '~/types.ts';
import { faker } from 'faker';

type MessageOptions = {
  method: string;
  path: string;
  status: number;
  start: number;
  message?: string;
};

export function createMessageOptions(): MessageOptions {
  const httpOptions = createHttpArgs();
  return {
    method: httpOptions[0],
    path: httpOptions[1],
    status: httpOptions[2],
    start: Date.now(),
  };
}

export function createHttpArgs(): HttpArgs {
  return [
    faker.internet.httpMethod(),
    faker.system.directoryPath(),
    faker.internet.httpStatusCode(),
  ];
}

export function createRandomArgs(n: number = Math.floor(Math.random() * 5)) {
  let args: string[] = [];
  let cnt = 0;

  while (cnt++ < n) {
    args = [...args, faker.word.sample()];
  }

  return args;
}
