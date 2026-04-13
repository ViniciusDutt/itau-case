import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { StatementResponseDTO } from './dtos/statement.dto';
import { StatementMapper } from './mappers/statement.mapper';
import { Transaction } from './models/transaction.model';
import { environment } from '../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class StatementService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapper = inject(StatementMapper);
  private readonly API_URL = `${environment.apiUrl}/funds`;

  #transactions = signal<Transaction[]>([]);
  public transactions = this.#transactions.asReadonly();

  #totalItems = signal<number>(0);
  public totalItems = this.#totalItems.asReadonly();

  #loading = signal<boolean>(false);
  public loading = this.#loading.asReadonly();

  #error = signal<string | null>(null);
  public error = this.#error.asReadonly();

  public fetchTransactions(filters: any = {}): void {
    this.#loading.set(true);

    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.append(key, filters[key]);
      }
    });

    this.http.get<StatementResponseDTO>(this.API_URL, { params })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.#loading.set(false))
      )
      .subscribe({
        next: (res) => {
          const data = res.data.map(item => this.mapper.toDomain(item));
          this.#transactions.set(data);
          this.#totalItems.set(res.total);
          this.#error.set(null);
        },
        error: (err) => {
          console.error('Erro ao buscar extrato:', err);
          this.#transactions.set([]);
          this.#totalItems.set(0);
          this.#error.set('Erro ao carregar o extrato. Tente novamente.');
        }
      });
  }

  public clearTransactions(): void {
    this.#transactions.set([]);
    this.#error.set(null);
  }

  public createTransaction(transaction: Transaction): Observable<any> {
    return this.http.post(`${this.API_URL}`, {
      codigo: transaction.codigo,
      nome: transaction.nome,
      cnpj: transaction.cnpj,
      codigoTipo: transaction.codigoTipo,
      patrimonio: transaction.rawPatrimonio
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public updateTransaction(codigo: string, transaction: Partial<Transaction>): Observable<any> {
    return this.http.patch(`${this.API_URL}/${codigo}`, {
      nome: transaction.nome,
      cnpj: transaction.cnpj,
      codigoTipo: transaction.codigoTipo,
      patrimonio: transaction.rawPatrimonio
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public updateTransactionPatrimony(codigo: string, patrimonio: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/${codigo}`, {
      patrimonio
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public deleteTransaction(codigo: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${codigo}`).pipe(
      takeUntilDestroyed(this.destroyRef)
    );
  }
}
