import { Component, input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export interface TableColumn<T = any> {
  label: string;
  key: string;
  sortable?: boolean;
  getCellClass?: (row: T) => string | null;
  cellTemplate?: TemplateRef<{ $implicit: T }>;
}

@Component({
  selector: 'app-table',
  imports: [CommonModule, IconComponent],
  templateUrl: './table.component.html'
})
export class TableComponent<T extends Record<string, unknown> = Record<string, unknown>> {
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  isLoading = input<boolean>(false);
  onSort = input<(column: TableColumn<T>) => void>();
}
