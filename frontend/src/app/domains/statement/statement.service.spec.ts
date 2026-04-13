import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { StatementService } from './statement.service';
import { StatementMapper } from './mappers/statement.mapper';
import { CurrencyFormatterService } from '../../shared/services/currency-formatter.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { StatementResponseDTO } from './dtos/statement.dto';

describe('StatementService', () => {
  let httpMock: HttpTestingController;
  let service: StatementService;
  const API_URL = `${environment.apiUrl}/funds`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        StatementService,
        StatementMapper,
        CurrencyFormatterService
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(StatementService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchTransactions', () => {
    it('should make GET request and store transactions', (done) => {
      const mockResponse: StatementResponseDTO = {
        data: [
          {
            codigo: 'TX001',
            nome: 'Transaction 1',
            cnpj: '12345678000190',
            codigoTipo: 'FI',
            patrimonio: 5000,
            type: { codigo: 'FI001', nome: 'Fund' },
            createdAt: '2024-01-15T10:30:00Z'
          }
        ],
        page: 1,
        limit: 10,
        total: 1
      };

      service.fetchTransactions();

      setTimeout(() => {
        const req = httpMock.expectOne(API_URL);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        setTimeout(() => {
          expect(service.transactions().length).toBe(1);
          expect(service.totalItems()).toBe(1);
          done();
        });
      });
    });

    it('should send filters as query params', (done) => {
      const mockResponse: StatementResponseDTO = {
        data: [],
        page: 1,
        limit: 10,
        total: 0
      };

      const filters = { nome: 'Test', codigoTipo: 'FI' };
      service.fetchTransactions(filters);

      setTimeout(() => {
        const req = httpMock.expectOne(r =>
          r.url === API_URL &&
          r.params.get('nome') === 'Test' &&
          r.params.get('codigoTipo') === 'FI'
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
        done();
      });
    });

    it('should set loading state correctly', (done) => {
      const mockResponse: StatementResponseDTO = {
        data: [],
        page: 1,
        limit: 10,
        total: 0
      };

      expect(service.loading()).toBe(false);

      service.fetchTransactions();

      setTimeout(() => {
        expect(service.loading()).toBe(true);

        const req = httpMock.expectOne(API_URL);
        req.flush(mockResponse);

        setTimeout(() => {
          expect(service.loading()).toBe(false);
          done();
        });
      });
    });

    it('should handle errors gracefully', (done) => {
      service.fetchTransactions();

      setTimeout(() => {
        const req = httpMock.expectOne(API_URL);
        req.error(new ProgressEvent('error'));

        setTimeout(() => {
          expect(service.transactions().length).toBe(0);
          expect(service.error()).toBeTruthy();
          expect(service.loading()).toBe(false);
          done();
        });
      });
    });
  });

  describe('clearTransactions', () => {
    it('should clear all transactions', (done) => {
      const mockResponse: StatementResponseDTO = {
        data: [
          {
            codigo: 'TX001',
            nome: 'Test',
            cnpj: '12345678000190',
            codigoTipo: 'FI',
            patrimonio: 5000,
            type: { codigo: 'FI001', nome: 'Fund' },
            createdAt: '2024-01-15T10:30:00Z'
          }
        ],
        page: 1,
        limit: 10,
        total: 1
      };

      service.fetchTransactions();

      setTimeout(() => {
        const req = httpMock.expectOne(API_URL);
        req.flush(mockResponse);

        setTimeout(() => {
          expect(service.transactions().length).toBe(1);

          service.clearTransactions();

          expect(service.transactions().length).toBe(0);
          expect(service.error()).toBeNull();
          done();
        });
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should create transaction with POST', (done) => {
      const newTransaction = {
        codigo: 'TX002',
        nome: 'New Fund',
        cnpj: '12345678000190',
        codigoTipo: 'FI',
        patrimonio: '10000',
        rawPatrimonio: 10000
      };

      service.createTransaction(newTransaction as any).subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      setTimeout(() => {
        const req = httpMock.expectOne(API_URL);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.nome).toBe('New Fund');
        req.flush({});
      });
    });

    it('should update transaction with PATCH', (done) => {
      const codigo = 'TX001';
      const updateData = { nome: 'Updated', rawPatrimonio: 20000 };

      service.updateTransaction(codigo, updateData).subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      setTimeout(() => {
        const req = httpMock.expectOne(`${API_URL}/${codigo}`);
        expect(req.request.method).toBe('PATCH');
        req.flush({});
      });
    });

    it('should delete transaction with DELETE', (done) => {
      const codigo = 'TX001';

      service.deleteTransaction(codigo).subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      setTimeout(() => {
        const req = httpMock.expectOne(`${API_URL}/${codigo}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
      });
    });

    it('should update patrimony', (done) => {
      const codigo = 'TX001';
      const novoPatrimonio = 25000;

      service.updateTransactionPatrimony(codigo, novoPatrimonio).subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      setTimeout(() => {
        const req = httpMock.expectOne(`${API_URL}/${codigo}`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body.patrimonio).toBe(25000);
        req.flush({});
      });
    });
  });
});
