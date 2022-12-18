import { MongoClient } from 'mongo';
import config from '~/config.ts';

const { database } = config;

class Database {
  public client: MongoClient;

  constructor(public name: string, public url: string) {
    this.name = name;
    this.url = url;
    this.client = {} as MongoClient;
  }

  async connect() {
    const client: MongoClient = new MongoClient();
    await client.connect(this.url);
    this.client = client;
  }

  get getDatabase() {
    return this.client.database(this.name);
  }
}

const db = new Database(database.name, database.host);
try {
  await db.connect();
} catch (error) {
  console.log(error);
}

export default db;
