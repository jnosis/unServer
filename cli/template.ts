export const controllerTemplate = (name: string, handlers: string[]) => {
  const Name = name.replace(/\b[a-z]/, (letter) => letter.toUpperCase());
  const methods = handlers.map((handler) =>
    `${handler} = (req: OpineRequest, res: OpineResponse) => {}`
  ).join('\n\n  ');

  return `import { OpineRequest, OpineResponse } from 'opine';
import {
  I${Name}Controller,
  ${Name}Data,
  ${Name}InputData,
  ${Name}Model,
} from '~/types.ts';
import { throwError } from '~/middleware/error_handler.ts';
import log from '~/middleware/logger.ts';
import { convertToMessage } from '~/util/message.ts';

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
  return `import { Database, ObjectId } from 'mongo';
import { ${Name}Data, ${Name}InputData, ${Name}Model, ${Name}Schema } from '~/types.ts';
import db from '~/db.ts';

const ${Name} = db.getDatabase;

class ${Name}Repository implements ${Name}Model {
  #${name};
  constructor(db: Database) {
    this.#${name} = db.collection<${Name}Schema>('${name}s');
  }

  async getAll() {
    return await this.#${name}.find().toArray().then((${name}s) =>
      ${name}s.map(mapOptionalData).filter((${name}): ${name} is ${Name}Data => !!${name})
    );
  }

  async create(${name}: ${Name}InputData) {
    return await this.#${name}.insertOne(${name}).then((insertedId) =>
      mapOptionalData({ ...${name}, _id: insertedId })
    );
  }

  async update(title: string, ${name}: ${Name}InputData) {
    return await this.#${name}.updateOne({ title }, { $set: ${name} }).then(async () =>
      await this.#${name}.findOne({ title }).then(mapOptionalData)
    );
  }

  async remove(title: string) {
    return await this.#${name}.deleteOne({ title });
  }
}

function mapOptionalData(data?: ${Name}Schema): ${Name}Data | undefined {
  return data ? { ...data, id: data._id.toString() } : data;
}

export const ${name}Repository = new ${Name}Repository(${Name});
`;
};

export const routerTemplate = (
  name: string,
  endpoints: Record<string, string[]>,
) => {
  const Name = name.replace(/\b[a-z]/, (letter) => letter.toUpperCase());
  const routers = Object.keys(endpoints).map((method) =>
    endpoints[method].map((endpoint) =>
      `router.${method}('${endpoint}', ${name}Controller);`
    )
  ).flat().join('\n  ');

  return `import { Router } from 'opine';
import { z } from 'zod';
import { I${Name}Controller } from '~/types.ts';
import { isAuth } from '~/middleware/auth.ts';
import { validate } from '~/middleware/validator.ts';

const router = Router();

const validate${Name} = validate({});

export default function ${name}Router(${name}Controller: I${Name}Controller) {
  ${routers}

  return router;
}
`;
};
