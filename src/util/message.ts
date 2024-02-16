type Message = {
  method: string;
  path: string;
  status: number;
  message?: string;
};

export const convertToMessage = (msg: Message): string => {
  const { method, path, status, message } = msg;
  return `${method} ${path} ${status} ${message ? message : ''}`;
};
