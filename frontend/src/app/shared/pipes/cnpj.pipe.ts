import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyFormatterService } from '../services/currency-formatter.service';

@Pipe({
  name: 'cnpj',
  standalone: true
})
export class CnpjPipe implements PipeTransform {
  private currencyFormatter = inject(CurrencyFormatterService);

  transform(value: string | number | null | undefined): string {
    if (!value) return '';
    return this.currencyFormatter.formatCnpj(value);
  }
}
