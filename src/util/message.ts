type Message = {
  method: string;
  baseUrl: string;
  status: number;
  param?: string;
  message?: string;
};

export const convertToMessage = (msg: Message): string => {
  const { method, baseUrl, param, status, message } = msg;
  const path = `${baseUrl}${param ? `/${param}` : ''}`;
  return `${method} ${path} ${status} ${message ? message : ''}`;
};
