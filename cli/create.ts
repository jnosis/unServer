import {
  controllerTemplate,
  modelTemplate,
  routerTemplate,
} from './template.ts';

type CreateOptions = {
  endpoints: Record<string, string[]>;
  handlers: string[];
};

export async function createAll(name: string, options: CreateOptions) {
  console.log('Create All');
  await createController(name, options.handlers);
  await createModel(name);
  await createRouter(name, options.endpoints);
}
export async function createController(name: string, handlers: string[]) {
  console.log('Create controller');
  await Deno.writeTextFile(
    `./src/controller/${name}.ts`,
    controllerTemplate(name, handlers),
  );
}

export async function createModel(name: string) {
  console.log('Create model');
  await Deno.writeTextFile(`./src/model/${name}.ts`, modelTemplate(name));
}

export async function createRouter(
  name: string,
  endpoints: Record<string, string[]>,
) {
  console.log('Create router');
  await Deno.writeTextFile(
    `./src/router/${name}.ts`,
    routerTemplate(name, endpoints),
  );
}
