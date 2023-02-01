import { MongoClient } from 'mongo';
import config from '~/config.ts';

const { mongodb } = config;

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

const db = new Database(mongodb.name, mongodb.host);
try {
  await db.connect();
} catch (error) {
  console.log(error);
}

export default db;
