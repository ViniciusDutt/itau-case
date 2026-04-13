import { Router, Request } from 'express';
import { funds, fundTypes } from '../data/db';
import { parseSortParams, sortArray } from '../utils/sort';

const router = Router();

router.get('/summary', (_req: Request, res) => {
  const totalPatrimonio = funds.reduce((sum, f) => sum + f.patrimonio, 0);
  const totalRows = funds.length;
  const uniqueCategories = new Set(funds.map(f => f.codigoTipo)).size;

  res.json({
    totalPatrimonio,
    totalRows,
    totalCategories: uniqueCategories
  });
});

router.get('/', (req: Request, res) => {
  let filtered = [...funds];

  // Filtro por nome (case-insensitive contains)
  if (req.query.nome) {
    const nomeFilter = String(req.query.nome).toLowerCase();
    filtered = filtered.filter(f => f.nome.toLowerCase().includes(nomeFilter));
  }

  // Filtro por cnpj (match exato)
  if (req.query.cnpj) {
    const cnpjFilter = String(req.query.cnpj);
    filtered = filtered.filter(f => f.cnpj === cnpjFilter);
  }

  // Filtro por codigo (case-insensitive contains)
  if (req.query.codigo) {
    const codigoFilter = String(req.query.codigo).toLowerCase();
    filtered = filtered.filter(f => f.codigo.toLowerCase().includes(codigoFilter));
  }

  // Filtro por codigoTipo (match exato)
  if (req.query.codigoTipo) {
    const codigoTipoFilter = String(req.query.codigoTipo);
    filtered = filtered.filter(f => f.codigoTipo === codigoTipoFilter);
  }

  // Filtro por createdAt (YYYY-MM-DD format)
  if (req.query.createdAt) {
    const dateFilter = String(req.query.createdAt);
    filtered = filtered.filter(f => f.createdAt.toISOString().startsWith(dateFilter));
  }

  // Ordenação (aplicada após filtros, antes de paginação)
  const sortConfigs = parseSortParams(
    req.query.sortBy as string,
    req.query.order as string,
    req.query.sort as string
  );
  filtered = sortArray(filtered, sortConfigs);

  // Paginação (aplicada após filtros e ordenação)
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedFunds = filtered.slice(start, end);

  const result = paginatedFunds.map(f => ({
    nome: f.nome,
    cnpj: f.cnpj,
    codigo: f.codigo,
    codigoTipo: f.codigoTipo,
    patrimonio: f.patrimonio,
    createdAt: f.createdAt.toISOString(),
    type: fundTypes.find(t => t.codigo === f.codigoTipo)
  }));

  res.json({
    data: result,
    page,
    limit,
    total: filtered.length
  });
});

router.post('/', (req, res) => {
  const { nome, cnpj, codigo, codigoTipo, patrimonio } = req.body;

  if (!nome || cnpj === undefined || codigo === undefined || codigoTipo === undefined || patrimonio === undefined) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  const cnpjString = String(cnpj);
  const codigoString = String(codigo);
  const codigoTipoString = String(codigoTipo);
  const patrimonioNumber = Number(patrimonio);

  if (cnpjString.length !== 14) {
    return res.status(400).json({ message: 'CNPJ deve ter exatamente 14 caracteres' });
  }

  if (codigoString.length > 20) {
    return res.status(400).json({ message: 'Código deve ter no máximo 20 caracteres' });
  }

  if (!fundTypes.find(t => t.codigo === codigoTipoString)) {
    return res.status(400).json({ message: 'codigoTipo inválido' });
  }

  if (isNaN(patrimonioNumber)) {
    return res.status(400).json({ message: 'patrimonio deve ser um número' });
  }

  const newFund = {
    nome,
    cnpj: cnpjString,
    codigo: codigoString,
    codigoTipo: codigoTipoString,
    patrimonio: patrimonioNumber,
    createdAt: new Date()
  };

  funds.push(newFund);

  res.status(201).json({
    ...newFund,
    createdAt: newFund.createdAt.toISOString(),
    type: fundTypes.find(t => t.codigo === newFund.codigoTipo)
  });
});

router.patch('/:codigo', (req: Request, res) => {
  const { codigo: codigoParam } = req.params;
  const { nome, cnpj, codigo, codigoTipo, patrimonio } = req.body;

  const fundIndex = funds.findIndex(f => f.codigo === codigoParam);

  if (fundIndex === -1) {
    return res.status(404).json({ message: 'Fundo não encontrado' });
  }

  const fund = funds[fundIndex];

  if (nome !== undefined) {
    fund.nome = nome;
  }

  if (cnpj !== undefined) {
    const cnpjString = String(cnpj);
    if (cnpjString.length !== 14) {
      return res.status(400).json({ message: 'CNPJ deve ter exatamente 14 caracteres' });
    }
    fund.cnpj = cnpjString;
  }

  if (codigo !== undefined) {
    const codigoString = String(codigo);
    if (codigoString.length > 20) {
      return res.status(400).json({ message: 'Código deve ter no máximo 20 caracteres' });
    }
    fund.codigo = codigoString;
  }

  if (codigoTipo !== undefined) {
    const codigoTipoString = String(codigoTipo);
    if (!fundTypes.find(t => t.codigo === codigoTipoString)) {
      return res.status(400).json({ message: 'codigoTipo inválido' });
    }
    fund.codigoTipo = codigoTipoString;
  }

  if (patrimonio !== undefined) {
    const patrimonioNumber = Number(patrimonio);
    if (isNaN(patrimonioNumber)) {
      return res.status(400).json({ message: 'patrimonio deve ser um número' });
    }
    fund.patrimonio = patrimonioNumber;
  }

  res.json({
    ...fund,
    createdAt: fund.createdAt.toISOString(),
    type: fundTypes.find(t => t.codigo === fund.codigoTipo)
  });
});

router.delete('/:codigo', (req: Request, res) => {
  const { codigo } = req.params;
  const fundIndex = funds.findIndex(f => f.codigo === codigo);

  if (fundIndex === -1) {
    return res.status(404).json({ message: 'Fundo não encontrado' });
  }

  funds.splice(fundIndex, 1);

  res.status(204).send();
});

export default router;