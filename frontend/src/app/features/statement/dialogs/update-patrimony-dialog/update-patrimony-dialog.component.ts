import { Component, inject, input, output, signal, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyFormatterService } from '../../../../shared/services/currency-formatter.service';
import { InputComponent } from '../../../../shared/components/ui/input/input.component';
import { formatPatrimonyValue, hasPatrimonyValueChanged } from '../../../../shared/utils/patrimony.utils';

@Component({
  selector: 'app-update-patrimony-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './update-patrimony-dialog.component.html',
  styleUrl: './update-patrimony-dialog.component.css'
})
export class UpdatePatrimonyDialogComponent {
  private fb = inject(NonNullableFormBuilder);
  private currencyFormatter = inject(CurrencyFormatterService);
  private destroyRef = inject(DestroyRef);

  patrimonioValue = input<string>('');
  patrimonioUpdated = output<number>();
  cancelled = output<void>();

  isSubmitting = signal(false);

  form = this.fb.group({
    patrimonio: ['', [Validators.required]]
  });

  constructor() {
    // Populate form when input changes
    effect(() => {
      const valor = this.patrimonioValue();
      if (valor) {
        this.form.patchValue({ patrimonio: valor }, { emitEvent: false });
      }
    });

    // Format Patrimonio as user types - with proper cleanup
    this.form.get('patrimonio')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) {
          this.updatePatrimonioField(value);
        }
      });
  }

  onSubmit(): void {
    if (this.form.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      try {
        const patrimonio = this.form.getRawValue().patrimonio || '';
        const patrimonioValue = this.currencyFormatter.parseCurrency(patrimonio);

        this.patrimonioUpdated.emit(patrimonioValue);
        this.resetForm();
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset();
  }

  private updatePatrimonioField(value: string | number): void {
    const formatted = formatPatrimonyValue(value);

    if (!formatted) {
      this.form.get('patrimonio')?.setValue('', { emitEvent: false });
      return;
    }

    // Only update if different to avoid cursor issues
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
    return 'Campo inválido';
  }
}
