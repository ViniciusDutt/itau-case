import { StatementSearchService } from './statement-search.service';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('StatementSearchService', () => {
  let service: StatementSearchService;

  beforeEach(() => {
    service = new StatementSearchService();
  });

  describe('Filters', () => {
    it('deve aplicar filtros corretamente', () => {
      service.applyFilters({ nome: 'Fundo XYZ', codigoTipo: 'FI' });

      expect(service.filters().nome).toBe('Fundo XYZ');
      expect(service.filters().codigoTipo).toBe('FI');
    });

    it('deve sobrescrever filtros anteriores', () => {
      service.applyFilters({ nome: 'Primeiro' });
      service.applyFilters({ nome: 'Segundo', codigoTipo: 'FI' });

      expect(service.filters().nome).toBe('Segundo');
    });
  });

  describe('Sorting', () => {
    it('deve aplicar sort asc para novo campo', () => {
      service.applySort('codigo');

      expect(service.sort()).toEqual({
        field: 'codigo',
        direction: 'asc'
      });
    });

    it('deve alternar entre asc e desc no mesmo campo', () => {
      service.applySort('codigo');
      expect(service.sort()?.direction).toBe('asc');

      service.applySort('codigo');
      expect(service.sort()?.direction).toBe('desc');
    });

    it('deve resetar sort ao mudar para outro campo', () => {
      service.applySort('codigo');
      service.applySort('data');

      expect(service.sort()?.field).toBe('data');
      expect(service.sort()?.direction).toBe('asc');
    });
  });

  describe('Pagination', () => {
    it('deve setar página válida', () => {
      service.setPage(5);
      expect(service.page()).toBe(5);
    });

    it('não deve setar página menor que 1', () => {
      service.setPage(5);
      service.setPage(0);
      expect(service.page()).toBe(5);
    });

    it('deve setar limit válido', () => {
      service.setLimit(20);
      expect(service.limit()).toBe(20);
    });
  });

  describe('Query Params', () => {
    it('deve incluir page e limit sempre', () => {
      const params = service.queryParams();

      expect(params['page']).toBe('1');
      expect(params['limit']).toBe('10');
    });

    it('deve incluir filtros quando definidos', () => {
      service.applyFilters({ nome: 'Fundo XYZ', codigoTipo: 'FI' });

      const params = service.queryParams();

      expect(params['nome']).toBe('Fundo XYZ');
      expect(params['codigoTipo']).toBe('FI');
    });

    it('deve incluir sort quando definido', () => {
      service.applySort('codigo');

      const params = service.queryParams();

      expect(params['sort']).toBe('codigo:asc');
    });

    it('deve incluir todos os parâmetros juntos', () => {
      service.applyFilters({ nome: 'Fundo', codigoTipo: 'FI' });
      service.applySort('data');
      service.setPage(3);
      service.setLimit(25);

      const params = service.queryParams();

      expect(params['nome']).toBe('Fundo');
      expect(params['codigoTipo']).toBe('FI');
      expect(params['sort']).toBe('data:asc');
      expect(params['page']).toBe('3');
      expect(params['limit']).toBe('25');
    });
  });

  describe('Clear', () => {
    it('deve resetar filtros, sort e página', () => {
      service.applyFilters({ nome: 'Teste' });
      service.applySort('codigo');
      service.setPage(5);

      service.clear();

      expect(service.filters()).toEqual({});
      expect(service.sort()).toBeNull();
      expect(service.page()).toBe(1);
    });
  });

  describe('Restore From Query Params', () => {
    it('deve restaurar filtros válidos do URL', () => {
      service.restoreFromQueryParams({ nome: 'Fundo', codigoTipo: 'FI123' });

      expect(service.filters().nome).toBe('Fundo');
      expect(service.filters().codigoTipo).toBe('FI123');
    });

    it('deve restaurar sort válido do URL', () => {
      service.restoreFromQueryParams({ sort: 'codigo:asc' });

      expect(service.sort()).toEqual({
        field: 'codigo',
        direction: 'asc'
      });
    });

    it('não deve restaurar sort com field inválido', () => {
      service.restoreFromQueryParams({ sort: 'fieldInvalido:asc' });

      expect(service.sort()).toBeNull();
    });

    it('deve restaurar page e limit válidos', () => {
      service.restoreFromQueryParams({ page: '3', limit: '20' });

      expect(service.page()).toBe(3);
      expect(service.limit()).toBe(20);
    });

    it('deve restaurar múltiplos parâmetros juntos', () => {
      service.restoreFromQueryParams({
        nome: 'Fundo',
        codigoTipo: 'FI',
        sort: 'patrimonio:desc',
        page: '2',
        limit: '15'
      });

      expect(service.filters().nome).toBe('Fundo');
      expect(service.sort()?.field).toBe('patrimonio');
      expect(service.page()).toBe(2);
      expect(service.limit()).toBe(15);
    });
  });
});
