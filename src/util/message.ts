type MessageOptions = {
  method: string;
  path: string;
  status: number;
  start: number;
  message?: string;
};

export const convertToMessage = (options: MessageOptions) => {
  const { method, path, status, start, message } = options;
  const elapsed = '- ' + time(start);
  const msg = message ? `${message} ${elapsed}` : elapsed;
  const args = [method, path, status];
  return [msg, args];
};

export function time(start: number) {
  return (Date.now() - start) + 'ms';
}
