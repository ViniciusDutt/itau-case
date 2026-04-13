import { Pipe, PipeTransform, inject } from '@angular/core';
import { FormatterService } from '../services/formatter.service';

@Pipe({
  name: 'cnpj',
  standalone: true
})
export class CnpjPipe implements PipeTransform {
  private formatter = inject(FormatterService);

  transform(value: string | number | null | undefined): string {
    if (!value) return '';
    return this.formatter.formatCnpj(value);
  }
}
