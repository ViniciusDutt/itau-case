import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

export interface FundType {
  codigo: string;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class FundTypeService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly API_URL = `${environment.apiUrl}/fund-types`;

  #fundTypes = signal<FundType[]>([]);
  public fundTypes = this.#fundTypes.asReadonly();

  #isLoaded = signal(false);
  public isLoaded = this.#isLoaded.asReadonly();

  #isLoading = signal(false);
  public isLoading = this.#isLoading.asReadonly();

  #error = signal<string | null>(null);
  public errorSignal = this.#error.asReadonly();

  constructor() {
    this.loadFundTypesIfNeeded();
  }

  private loadFundTypes(): void {
    if (this.#isLoading() || this.#isLoaded()) {
      return;
    }

    this.#isLoading.set(true);
    this.http.get<FundType[]>(this.API_URL)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.#isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.#fundTypes.set(data);
          this.#isLoaded.set(true);
          this.#error.set(null);
        },
        error: (err) => {
          console.error('Erro ao carregar tipos de fundos:', err);
          this.#error.set('Erro ao carregar tipos de fundos');
          this.#isLoaded.set(true);
        }
      });
  }

  public loadFundTypesIfNeeded(): void {
    if (!this.#isLoaded() && !this.#isLoading()) {
      this.loadFundTypes();
    }
  }

}
