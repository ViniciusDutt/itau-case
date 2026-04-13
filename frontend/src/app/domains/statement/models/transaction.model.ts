export interface Transaction extends Record<string, unknown> {
  codigo: string;
  nome: string;
  cnpj: string;
  tema: string;
  data: string;
  codigoTipo: string;
  rawPatrimonio: number;
  patrimonio: string;
}
