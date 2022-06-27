import { opine, opineCors } from '../deps.ts';

const app = opine();
app.use(opineCors());

app.listen({ port: 3000 });
