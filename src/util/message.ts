type MessageOptions = {
  method: string;
  path: string;
  status: number;
  message?: string;
};

export const convertToMessage = (options: MessageOptions) => {
  const { method, path, status, message } = options;
  const args = [method, path, status];
  const msg = message || '';
  return [msg, args];
};
