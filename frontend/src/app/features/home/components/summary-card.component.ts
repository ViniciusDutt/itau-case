import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border border-border p-4 rounded-xl bg-white">
      <h3 class="m-0 mb-3 text-base text-secondary font-semibold">{{ title }}</h3>
      <p class="m-0 text-2xl w-full text-end text-primary font-bold">{{ displayValue }}</p>
    </div>
  `
})
export class SummaryCardComponent {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() isCurrency: boolean = false;

  get displayValue(): string {
    if (this.isCurrency && typeof this.value === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(this.value);
    }
    return String(this.value);
  }
}
