import { describe, it, expect, beforeEach } from '@jest/globals';
import { StatementMapper } from './statement.mapper';
import { CurrencyFormatterService } from '../../../shared/services/currency-formatter.service';
import { TransactionDTO } from '../dtos/statement.dto';

describe('StatementMapper', () => {
  let mapper: StatementMapper;
  let currencyFormatterService: CurrencyFormatterService;

  beforeEach(() => {
    currencyFormatterService = new CurrencyFormatterService();
    mapper = new StatementMapper(currencyFormatterService);
  });

  describe('toDomain', () => {
    it('deve mapear DTO para Transaction corretamente', () => {
      const dto: TransactionDTO = {
        codigo: 'ABC123',
        nome: 'Fundo XYZ',
        cnpj: '12345678000190',
        codigoTipo: 'FI',
        patrimonio: 50000,
        type: { codigo: 'FI001', nome: 'Fundo de Investimento' },
        createdAt: '2024-01-15T10:30:00Z'
      };

      const result = mapper.toDomain(dto);

      expect(result.codigo).toBe('ABC123');
      expect(result.nome).toBe('Fundo XYZ');
      expect(result.codigoTipo).toBe('FI');
      expect(result.tema).toBe('Fundo de Investimento');
      expect(result.rawPatrimonio).toBe(50000);
    });

    it('deve formatar patrimonio como moeda', () => {
      jest.spyOn(currencyFormatterService, 'formatCurrency').mockReturnValue('R$ 50.000,00');

      const dto: TransactionDTO = {
        codigo: 'ABC123',
        nome: 'Fundo XYZ',
        cnpj: '12345678000190',
        codigoTipo: 'FI',
        patrimonio: 50000,
        type: { codigo: 'FI001', nome: 'Fundo' },
        createdAt: '2024-01-15T10:30:00Z'
      };

      const result = mapper.toDomain(dto);

      expect(result.patrimonio).toBe('R$ 50.000,00');
      expect(currencyFormatterService.formatCurrency).toHaveBeenCalledWith(50000);
    });

    it('deve formatar CNPJ corretamente', () => {
      jest.spyOn(currencyFormatterService, 'formatCnpj').mockReturnValue('12.345.678/0001-90');

      const dto: TransactionDTO = {
        codigo: 'ABC123',
        nome: 'Fundo XYZ',
        cnpj: '12345678000190',
        codigoTipo: 'FI',
        patrimonio: 50000,
        type: { codigo: 'FI001', nome: 'Fundo' },
        createdAt: '2024-01-15T10:30:00Z'
      };

      const result = mapper.toDomain(dto);

      expect(result.cnpj).toBe('12.345.678/0001-90');
      expect(currencyFormatterService.formatCnpj).toHaveBeenCalledWith('12345678000190');
    });

    it('deve retornar tema como "N/A" quando type.nome não existe', () => {
      const dto: any = {
        codigo: 'ABC123',
        nome: 'Fundo XYZ',
        cnpj: '12345678000190',
        codigoTipo: 'FI',
        patrimonio: 50000,
        type: { codigo: 'FI001' }, // sem nome
        createdAt: '2024-01-15T10:30:00Z'
      };

      const result = mapper.toDomain(dto);

      expect(result.tema).toBe('N/A');
    });

    it('deve retornar CNPJ vazio quando é string vazia', () => {
      const dto: TransactionDTO = {
        codigo: 'ABC123',
        nome: 'Fundo XYZ',
        cnpj: '',
        codigoTipo: 'FI',
        patrimonio: 50000,
        type: { codigo: 'FI001', nome: 'Fundo' },
        createdAt: '2024-01-15T10:30:00Z'
      };

      const result = mapper.toDomain(dto);

      expect(result.cnpj).toBe('');
    });

    it('deve formatar data corretamente', () => {
      const dto: TransactionDTO = {
        codigo: 'ABC123',
        nome: 'Fundo XYZ',
        cnpj: '12345678000190',
        codigoTipo: 'FI',
        patrimonio: 50000,
        type: { codigo: 'FI001', nome: 'Fundo' },
        createdAt: '2024-01-15T10:30:00Z'
      };

      const result = mapper.toDomain(dto);

      // Esperamos dd/MM/yy format baseado em pt-BR
      expect(result.data).toBeTruthy();
      expect(result.data).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
    });

    it('deve retornar data vazia quando createdAt é vazio', () => {
      const dto: TransactionDTO = {
        codigo: 'ABC123',
        nome: 'Fundo XYZ',
        cnpj: '12345678000190',
        codigoTipo: 'FI',
        patrimonio: 50000,
        type: { codigo: 'FI001', nome: 'Fundo' },
        createdAt: ''
      };

      const result = mapper.toDomain(dto);

      expect(result.data).toBe('');
    });

    it('deve preservar rawPatrimonio para operações de API', () => {
      const dto: TransactionDTO = {
        codigo: 'ABC123',
        nome: 'Fundo XYZ',
        cnpj: '12345678000190',
        codigoTipo: 'FI',
        patrimonio: 75000,
        type: { codigo: 'FI001', nome: 'Fundo' },
        createdAt: '2024-01-15T10:30:00Z'
      };

      const result = mapper.toDomain(dto);

      expect(result.rawPatrimonio).toBe(75000);
      expect(typeof result.rawPatrimonio).toBe('number');
    });

    it('deve manter todos os campos da transação após mapeamento', () => {
      const dto: TransactionDTO = {
        codigo: 'TX123',
        nome: 'Teste',
        cnpj: '12345678000190',
        codigoTipo: 'FI',
        patrimonio: 1000,
        type: { codigo: 'FI001', nome: 'Fundo' },
        createdAt: '2024-01-15T10:30:00Z'
      };

      const result = mapper.toDomain(dto);

      expect(result).toMatchObject({
        codigo: 'TX123',
        nome: 'Teste',
        codigoTipo: 'FI',
        rawPatrimonio: 1000
      });
    });
  });
});
