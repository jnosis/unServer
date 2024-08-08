import { MongoClient } from 'mongo';
import { log, recorder } from '~/util/logger.ts';
import config from '~/config.ts';

class Database {
  #client: MongoClient;
  #name: string;
  #url: string;

  constructor(name: string, url: string) {
    this.#name = name;
    this.#url = url;
    this.#client = {} as MongoClient;
  }

  async connect() {
    const client = new MongoClient();
    await client.connect(this.#url);
    this.#client = client;
  }

  get getDatabase() {
    return this.#client.database(this.#name);
  }
}

const mongodb = new Database(config.mongodb.name, config.mongodb.host);
try {
  const start = Date.now();
  await mongodb.connect();
  log.info('MongoDB connected', { start });
} catch (error) {
  log.error(error);
  recorder.error(error, { error });
}

export default mongodb;
