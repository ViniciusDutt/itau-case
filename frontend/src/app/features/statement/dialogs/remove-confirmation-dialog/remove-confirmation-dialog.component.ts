import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../../domains/statement/models/transaction.model';

@Component({
  selector: 'app-remove-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remove-confirmation-dialog.component.html',
  styleUrl: './remove-confirmation-dialog.component.css'
})
export class RemoveConfirmationDialogComponent {
  transaction = input<Partial<Transaction> | null>(null);
  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
