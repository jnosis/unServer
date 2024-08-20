export const controllerTemplate = (name: string, handlers: string[]) => {
  const Name = name.replace(/\b[a-z]/, (letter) => letter.toUpperCase());
  const methods = handlers.map((handler) => `${handler} = (c: Context) => {}`)
    .join('\n\n  ');

  return `import type { Context } from 'hono';
import type {
  AuthEnv,
  I${Name}Controller,
  ${Name}Data,
  ${Name}InputData,
  ${Name}Model,
} from '~/types.ts';
import { throwError } from '~/helper/error.ts';

export class ${Name}Controller implements I${Name}Controller {
  #${name}Repository: ${Name}Model
  constructor(${name}Repository: ${Name}Model) {
    this.#${name}Repository = ${name}Repository;
  }

  ${methods}
}
`;
};

export const modelTemplate = (name: string) => {
  const Name = name.replace(/\b[a-z]/, (letter) => letter.toUpperCase());
  return `import type {
  SupabaseWithAuth,
  ${Name}Data,
  ${Name}InputData,
  ${Name}Model,
} from '~/types.ts';
import { supabase, supabaseWithAuth } from '~/supabase.ts';

class ${Name}Repository implements ${Name}Model {
  #supabase;
  constructor(supabase: SupabaseWithAuth) {
    this.#supabase = { ...supabase };
  }

  async getAll() {
    const { data } = await this.#getSupabase().select('*');
    return data ? data as ${Name}Data[] : [];
  }

  async create(${name}: ${Name}InputData, isAuth?: boolean) {
    const client = this.#getSupabase(isAuth);
    const { data } = await client
      .insert({ ...${name}, id: crypto.randomUUID() })
      .select('*');
    if (data) {
      return data[0] as ${Name}Data;
    }
  }

  async update(key: string, ${name}: ${Name}InputData, isAuth?: boolean) {
    const client = this.#getSupabase(isAuth);
    const { data } = await client
      .update({ ...${name} })
      .eq('key', key)
      .select('*');
    if (data) {
      return data[0] as ${Name}Data;
    }
  }

  async remove(key: string, isAuth?: boolean) {
    const client = this.#getSupabase(isAuth);
    const { count } = await client.delete().eq('key', key);
    return count ? count : 0;
  }

  #getSupabase(isAuth?: boolean) {
    return this.#supabase[isAuth ? 'withAuth' : 'withoutAuth'].from('${name}s');
  }
}

export const ${name}Repository = new ${Name}Repository({
  withAuth: supabaseWithAuth,
  withoutAuth: supabase,
});
`;
};

export const routerTemplate = (
  name: string,
  endpoints: Record<string, string[]>,
) => {
  const Name = name.replace(/\b[a-z]/, (letter) => letter.toUpperCase());
  const routers = Object.keys(endpoints).map((method) =>
    endpoints[method].map((endpoint) =>
      `.${method.toLowerCase()}('${endpoint}', ${name}Controller)`
    )
  ).flat().join('\n   ');

  return `import type { I${Name}Controller } from '~/types.ts';
  import { Hono } from 'hono';
import * as v from 'valibot';
import { isAuth } from '~/middleware/auth.ts';
import { validate } from '~/middleware/validator.ts';

const validate${Name} = validate({});

export default function ${name}Router(${name}Controller: I${Name}Controller) {
  const ${name} = new Hono()
    ${routers}

  return ${name};
}
`;
};
