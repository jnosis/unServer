import { opine, json, opineCors } from '../deps.ts';
import * as workRepository from './model/work.ts';
import { WorkController } from './controller/work.ts';
import workRouter from './router/work.ts';
import config from './config.ts';

const { cors } = config;

const app = opine();

const corsOptions = {
  origin: cors.origin,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(json());
app.use(opineCors(corsOptions));

app.get('/', (_req, res) => {
  res.send('Welcome to unServer');
});

app.use('/works', workRouter(new WorkController(workRepository)));

app.listen({ port: 3000 });
