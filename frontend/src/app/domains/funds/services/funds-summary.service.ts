import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { FundsSummaryDTO } from '../dtos/funds-summary.dto';
import { environment } from '../../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class FundsSummaryService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly API_URL = `${environment.apiUrl}/funds/summary`;

  #summary = signal<FundsSummaryDTO | null>(null);
  public summary = this.#summary.asReadonly();

  #loading = signal<boolean>(false);
  public loading = this.#loading.asReadonly();

  #isLoaded = signal<boolean>(false);
  public isLoaded = this.#isLoaded.asReadonly();

  #error = signal<string | null>(null);
  public error = this.#error.asReadonly();

  public fetchSummary(): void {
    this.#loading.set(true);
    this.#error.set(null);

    this.http.get<FundsSummaryDTO>(this.API_URL)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.#loading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.#summary.set(data);
          this.#isLoaded.set(true);
        },
        error: (err) => {
          console.error('Erro ao buscar resumo de fundos:', err);
          this.#error.set('Erro ao carregar o resumo. Tente novamente.');
          this.#isLoaded.set(true);
        }
      });
  }
}
