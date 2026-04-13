import { Component, input, output, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  label = input<string>('');
  type = input<InputType>('text');
  placeholder = input<string>('');
  showError = input<boolean>(false);
  errorMessage = input<string>('Campo inválido');
  required = input<boolean>(false);
  maxLength = input<number | null>(null);
  min = input<number | null>(null);
  max = input<number | null>(null);
  step = input<number | string | null>(null);
  pattern = input<string | null>(null);
  inputmode = input<'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | null>(null);

  private internalValue = signal<string | number>('');
  public displayValue = this.internalValue.asReadonly();

  public isDisabled = signal(false);

  change = output<string | number>();

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    let newValue = target.type === 'number' && target.value ? Number(target.value) : target.value;

    if (this.inputmode() === 'numeric' && typeof newValue === 'string') {
      const filtered = newValue.replace(/[^\d,.\-/]/g, '');
      if (filtered !== newValue) {
        target.value = filtered;
        newValue = filtered;
      }
    }

    this.internalValue.set(newValue);
    this.change.emit(newValue);
    this.onChange(newValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
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
    this.isDisabled.set(isDisabled);
  }
}
