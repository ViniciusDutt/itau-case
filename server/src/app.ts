import express from 'express';
import cors from 'cors';

import fundsRoutes from './routes/funds.routes';
import fundTypesRoutes from './routes/fund-types.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/funds', fundsRoutes);
app.use('/fund-types', fundTypesRoutes);

app.listen(3000, () => {
  console.log('API rodando em http://localhost:3000');
});