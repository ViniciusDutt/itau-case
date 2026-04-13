export interface FundType {
  codigo: string;
  nome: string;
}

export interface Fund {
  codigo: string;
  nome: string;
  cnpj: string;
  codigoTipo: string;
  patrimonio: number;
  createdAt: Date;
}
