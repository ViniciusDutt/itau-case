export interface StatementResponseDTO {
  data: TransactionDTO[];
  page: number;
  limit: number;
  total: number;
}

export interface TransactionDTO {
  codigo: string;
  nome: string;
  cnpj: string;
  codigoTipo: string;
  createdAt: string;
  type: {
    codigo: string;
    nome: string;
  };
  patrimonio: number;
}
