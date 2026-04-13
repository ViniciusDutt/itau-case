import { Component, input, output, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { FundTypeService } from '../../../../domains/statement/services/fund-type.service';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { SelectComponent, type SelectOption } from '../../../../shared/components/ui/select/select.component';

export interface StatementFilters {
  nome?: string;
  codigoTipo?: string;
}

@Component({
  selector: 'app-statement-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent, SelectComponent],
  templateUrl: './statement-filters.component.html'
})
export class StatementFiltersComponent {
  private fb = inject(NonNullableFormBuilder);
  protected fundTypeService = inject(FundTypeService);

  isLoading = input(false);
  hasData = input(false);

  fundTypeOptions = signal<SelectOption[]>([]);
  hasLoadedData = signal(false);

  fundTypeOptionsWithDefault = computed(() => [
    { value: '', label: 'Todos os tipos' },
    ...this.fundTypeOptions()
  ]);

  search = output<StatementFilters>();
  clear = output<void>();
  newTransaction = output<void>();

  filterForm = this.fb.group({
    nome: ['', [this.minLengthIfNotEmpty(3)]],
    codigoTipo: ['']
  });

  constructor() {
    effect(() => {
      const types = this.fundTypeService.fundTypes();
      this.fundTypeOptions.set(types.map(type => ({
        value: type.codigo,
        label: type.nome
      })));
    });

    effect(() => {
      const dataLoaded = this.hasData();
      if (dataLoaded) {
        this.hasLoadedData.set(true);
        this.filterForm.get('nome')?.enable({ emitEvent: false });
        this.filterForm.get('codigoTipo')?.enable({ emitEvent: false });
      } else if (!this.hasLoadedData()) {
        this.filterForm.get('nome')?.disable({ emitEvent: false });
        this.filterForm.get('codigoTipo')?.disable({ emitEvent: false });
      }
    });
  }

  private minLengthIfNotEmpty(length: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return control.value.length >= length ? null : { minlength: { requiredLength: length } };
    };
  }

  onSubmit(): void {
    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.markAsTouched();
    });

    if (this.filterForm.valid) {
      const formValue = this.filterForm.value;
      this.search.emit({
        nome: formValue.nome?.trim() || undefined,
        codigoTipo: formValue.codigoTipo && formValue.codigoTipo !== '' ? formValue.codigoTipo : undefined
      });
    }
  }

  onClear(): void {
    this.filterForm.reset();
    this.clear.emit();
  }

  onNewClick(): void {
    this.newTransaction.emit();
  }


  patchFormValues(filters: StatementFilters): void {
    this.filterForm.patchValue({
      nome: filters.nome || '',
      codigoTipo: filters.codigoTipo ? String(filters.codigoTipo) : ''
    });
  }

  reset(): void {
    this.filterForm.reset();
  }
}
