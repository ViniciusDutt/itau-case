import { Router, Request } from 'express';
import { fundTypes } from '../data/db';
import { parseSortParams, sortArray } from '../utils/sort';

const router = Router();

router.get('/', (req: Request, res) => {
  let result = [...fundTypes];

  // Ordenação
  const sortConfigs = parseSortParams(
    req.query.sortBy as string,
    req.query.order as string,
    req.query.sort as string
  );
  result = sortArray(result, sortConfigs);

  res.json(result);
});

export default router;