import { Component, input, output, signal, forwardRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('Selecione uma opção');
  options = input<SelectOption[]>([]);
  disabled = input<boolean>(false);
  showError = input<boolean>(false);
  errorMessage = input<string>('Campo inválido');
  required = input<boolean>(false);

  change = output<string | number>();

  private internalValue = signal<string | number>('');

  private isFormDisabled = signal<boolean>(false);

  public displayValue = this.internalValue.asReadonly();

  public isDisabled = computed(() => this.disabled() || this.isFormDisabled());

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  onValueChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const rawValue = target.value;

    this.internalValue.set(rawValue);

    this.change.emit(rawValue);
    this.onChange(rawValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: any): void {
    if (value !== undefined && value !== null && value !== '') {
      this.internalValue.set(value);
    } else {
      this.internalValue.set('');
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isFormDisabled.set(isDisabled);
  }
}
