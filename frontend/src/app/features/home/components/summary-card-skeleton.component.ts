import { Component } from '@angular/core';

@Component({
  selector: 'app-summary-card-skeleton',
  standalone: true,
  template: `
    <div class="border border-border p-4 rounded-xl bg-white">
      <div class="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
      <div class="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
    </div>
  `
})
export class SummaryCardSkeletonComponent {}
