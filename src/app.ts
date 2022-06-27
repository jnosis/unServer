import { opine, opineCors } from '../deps.ts';
import * as workRepository from './model/work.ts';
import { WorkController } from './controller/work.ts';
import workRouter from './router/work.ts';

const app = opine();
app.use(opineCors());

app.use('/works', workRouter(new WorkController(workRepository)));

app.listen({ port: 3000 });
