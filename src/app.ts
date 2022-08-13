import { json, opine } from 'opine';
import { type CorsOptions, opineCors } from 'cors';
import { userRepository } from './model/auth.ts';
import { workRepository } from './model/work.ts';
import { UserController } from './controller/auth.ts';
import { WorkController } from './controller/work.ts';
import userRouter from './router/auth.ts';
import workRouter from './router/work.ts';
import log from './middleware/logger.ts';
import { errorHandler } from './middleware/error_handler.ts';
import config from './config.ts';

const { cors } = config;

const app = opine();

const corsOptions: CorsOptions = {
  origin: cors.origin,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(json());
app.use(opineCors(corsOptions));

app.get('/', (_req, res) => {
  res.send('Welcome to unServer');
});

app.use('/auth', userRouter(new UserController(userRepository)));
app.use('/works', workRouter(new WorkController(workRepository)));

app.use(errorHandler);

app.listen({ port: 3000 }, () => {
  log.info(`Server is started...`);
});
