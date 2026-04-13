import { Component, inject, input, output, signal, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FundTypeService } from '../../../../domains/statement/services/fund-type.service';
import { CurrencyFormatterService } from '../../../../shared/services/currency-formatter.service';
import { Transaction } from '../../../../domains/statement/models/transaction.model';
import { SelectComponent, type SelectOption } from '../../../../shared/components/ui/select/select.component';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { formatPatrimonyValue, hasPatrimonyValueChanged } from '../../../../shared/utils/patrimony.utils';

@Component({
  selector: 'app-new-transaction-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectComponent, InputComponent],
  templateUrl: './new-transaction-dialog.component.html',
  styleUrl: './new-transaction-dialog.component.css'
})
export class NewTransactionDialogComponent {
  private fb = inject(NonNullableFormBuilder);
  protected fundTypeService = inject(FundTypeService);
  private currencyFormatter = inject(CurrencyFormatterService);
  private destroyRef = inject(DestroyRef);

  transactionEdit = input<Partial<Transaction> | null>(null);
  transactionCreated = output<Partial<Transaction>>();
  cancelled = output<void>();

  fundTypeOptions = signal<SelectOption[]>([]);
  isEditMode = signal(false);
  isSubmitting = signal(false);

  constructor() {
    effect(() => {
      const types = this.fundTypeService.fundTypes();
      this.fundTypeOptions.set(types.map(type => ({
        value: type.codigo,
        label: type.nome
      })));
    });

    effect(() => {
      const transactionToEdit = this.transactionEdit();
      if (transactionToEdit) {
        this.isEditMode.set(true);
        this.populateFormWithTransaction(transactionToEdit);
      } else {
        this.isEditMode.set(false);
      }
    });

    this.form.get('cnpj')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) {
          const formatted = this.currencyFormatter.formatCnpj(value);
          if (formatted !== value) {
            this.form.get('cnpj')?.setValue(formatted, { emitEvent: false });
          }
        }
      });

    this.form.get('patrimonio')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) {
          this.updatePatrimonioField(value);
        }
      });

  }

  private populateFormWithTransaction(transaction: Partial<Transaction>): void {
    this.form.patchValue({
      codigo: transaction.codigo || '',
      nome: transaction.nome || '',
      cnpj: transaction.cnpj || '',
      codigoTipo: transaction.codigoTipo || '',
      patrimonio: transaction.patrimonio || ''
    }, { emitEvent: false });
  }

  private validateCnpj = (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) return null;

    const onlyNumbers = String(control.value).replace(/\D/g, '');

    if (onlyNumbers.length !== 14) {
      return { invalidCnpj: true };
    }

    if (/^(\d)\1{13}$/.test(onlyNumbers)) {
      return { invalidCnpj: true };
    }

    return null;
  };

  private validateCodigoTipo = (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value || control.value === '' || control.value === 0) {
      return { invalidCodigoTipo: true };
    }
    return null;
  };

  private validatePatrimonio = (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }

    const parsed = this.currencyFormatter.parseCurrency(control.value);
    if (parsed <= 0) {
      return { invalidCurrency: { value: control.value } };
    }

    return null;
  };

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    cnpj: ['', [Validators.required, this.validateCnpj]],
    codigoTipo: ['', [Validators.required, this.validateCodigoTipo]],
    patrimonio: ['', [Validators.required, this.validatePatrimonio]]
  });

  onSubmit(): void {
    if (this.form.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const formValue = this.form.getRawValue();
      const cnpjOnlyNumbers = String(formValue.cnpj || '').replace(/\D/g, '');
      const patrimonioValue = this.currencyFormatter.parseCurrency(formValue.patrimonio || '');

      const transaction: Partial<Transaction> = {
        codigo: formValue.codigo || '',
        nome: formValue.nome || '',
        cnpj: cnpjOnlyNumbers,
        codigoTipo: formValue.codigoTipo || '',
        rawPatrimonio: patrimonioValue,
        patrimonio: this.currencyFormatter.formatCurrency(patrimonioValue)
      };

      this.transactionCreated.emit(transaction);
      this.resetForm();
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset();
    this.isEditMode.set(false);
    this.form.get('codigo')?.enable({ emitEvent: false });
  }

  private updatePatrimonioField(value: string | number): void {
    const formatted = formatPatrimonyValue(value);

    if (!formatted) {
      this.form.get('patrimonio')?.setValue('', { emitEvent: false });
      return;
    }

    if (hasPatrimonyValueChanged(formatted, value)) {
      this.form.get('patrimonio')?.setValue(formatted, { emitEvent: false });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Campo obrigatório';
    if (field.errors['minlength']) return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['maxlength']) return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    if (field.errors['invalidCnpj']) return 'CNPJ deve conter 14 dígitos válidos';
    if (field.errors['invalidCodigoTipo']) return 'Selecione um tipo de fundo';
    if (field.errors['invalidCurrency']) return 'Patrimônio deve ser um valor válido maior que zero';
    if (field.errors['pattern']) {
      return 'Formato inválido';
    }

    return 'Campo inválido';
  }
}
