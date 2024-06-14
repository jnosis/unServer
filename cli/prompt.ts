import { Checkbox, Confirm, Input, List } from '@cliffy/prompt';
import {
  createAll,
  createController,
  createModel,
  createRouter,
} from './create.ts';

type Options = {
  createAll?: boolean;
  createController?: boolean;
  createModel?: boolean;
  createRouter?: boolean;
};

export async function promptCreation(options: Options, arg?: string) {
  const name = arg || await Input.prompt({ message: 'Enter file name' });

  if (Object.keys(options).length === 0) {
    options = { ...(await askOptions()) };
  }

  if (options.createAll) {
    const createOptions = await promptAll();
    createAll(name, createOptions);
  } else {
    if (options.createController) {
      const handlers = await promptController();
      createController(name, handlers);
    }
    if (options.createModel) {
      createModel(name);
    }
    if (options.createRouter) {
      const endpoints = await promptRouter();
      createRouter(name, endpoints);
    }
  }
}

async function askOptions(): Promise<Options> {
  const createAll = await Confirm.prompt('Create All?');
  if (createAll) {
    return { createAll };
  }

  const selected = await Checkbox.prompt({
    message: 'Pick options',
    options: ['createController', 'createModel', 'createRouter'],
  });

  return {
    createController: selected.includes('createController'),
    createModel: selected.includes('createModel'),
    createRouter: selected.includes('createRouter'),
  };
}

async function promptAll() {
  const handlers = await promptController();
  const endpoints = await promptRouter();
  return { endpoints, handlers };
}

async function promptController() {
  return await List.prompt("Input controller's handlers");
}

async function promptRouter() {
  const routers = await Checkbox.prompt({
    message: 'Pick router',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  const endpoints: Record<string, string[]> = {};
  for (const router of routers) {
    endpoints[router] = await List.prompt(`Input ${router} router's endpoints`);
  }

  return endpoints;
}
