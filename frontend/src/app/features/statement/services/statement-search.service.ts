import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';

export interface SearchFilters {
  nome?: string;
  codigoTipo?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class StatementSearchService {
  private readonly ALLOWED_SORT_FIELDS = ['codigo', 'data', 'tema', 'nome', 'patrimonio'];
  private readonly MIN_LIMIT = 1;
  private readonly MAX_LIMIT = 100;

  private filtersSignal = signal<SearchFilters>({});
  private sortSignal = signal<SortConfig | null>(null);
  private pageSignal = signal<number>(1);
  private limitSignal = signal<number>(10);

  readonly filters = this.filtersSignal.asReadonly();
  readonly sort = this.sortSignal.asReadonly();
  readonly page = this.pageSignal.asReadonly();
  readonly limit = this.limitSignal.asReadonly();

  readonly queryParams = computed(() => {
    const params: Record<string, string> = {};
    const currentFilters = this.filters();
    const currentSort = this.sort();

    if (currentFilters.nome) {
      params['nome'] = currentFilters.nome;
    }
    if (currentFilters.codigoTipo) {
      params['codigoTipo'] = currentFilters.codigoTipo;
    }
    if (currentSort) {
      params['sort'] = `${currentSort.field}:${currentSort.direction}`;
    }

    params['page'] = String(this.page());
    params['limit'] = String(this.limit());

    return params;
  });

  applyFilters(filters: SearchFilters): void {
    this.filtersSignal.set(filters);
  }

  applySort(field: string): void {
    const currentSort = this.sort();

    if (currentSort?.field === field) {
      this.sortSignal.set({
        field,
        direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      this.sortSignal.set({ field, direction: 'asc' });
    }
  }

  setSort(sort: SortConfig | null): void {
    this.sortSignal.set(sort);
  }

  setPage(page: number): void {
    if (Number.isInteger(page) && page >= 1) {
      this.pageSignal.set(page);
    }
  }

  setLimit(limit: number): void {
    this.limitSignal.set(limit);
  }

  clear(): void {
    this.filtersSignal.set({});
    this.sortSignal.set(null);
    this.pageSignal.set(1);
  }

  restoreFromQueryParams(params: Record<string, any>): void {
    const filters: SearchFilters = {};

    if (params['nome'] && typeof params['nome'] === 'string') {
      filters.nome = params['nome'];
    }

    if (params['codigoTipo'] && /^[a-zA-Z0-9]+$/.test(params['codigoTipo'])) {
      filters.codigoTipo = params['codigoTipo'];
    }

    this.filtersSignal.set(filters);

    if (params['sort'] && typeof params['sort'] === 'string') {
      const parts = params['sort'].split(':');
      const field = parts[0];
      const direction = parts[1] as 'asc' | 'desc';

      if (field && this.ALLOWED_SORT_FIELDS.includes(field) && ['asc', 'desc'].includes(direction)) {
        this.sortSignal.set({ field, direction });
      }
    }

    if (params['page']) {
      const page = Number(params['page']);
      if (Number.isInteger(page) && page > 0) {
        this.pageSignal.set(page);
      }
    }

    if (params['limit']) {
      const limit = Number(params['limit']);
      if (Number.isInteger(limit) && limit >= this.MIN_LIMIT && limit <= this.MAX_LIMIT) {
        this.limitSignal.set(limit);
      }
    }
  }

}
