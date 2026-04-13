import { FundType, Fund } from '../types';

export const fundTypes: FundType[] = [
  { codigo: 'RF', nome: 'Renda Fixa' },
  { codigo: 'RFI', nome: 'Renda Fixa Internacional' },
  { codigo: 'RB', nome: 'Renda Variável' },
  { codigo: 'RVI', nome: 'Renda Variável Internacional' }
];

export let funds: Fund[] = [];