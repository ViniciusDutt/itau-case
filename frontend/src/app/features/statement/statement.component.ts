import { Component, inject, OnInit, TemplateRef, ViewChild, AfterViewInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StatementService } from '../../domains/statement/statement.service';
import { StatementSearchService } from './services/statement-search.service';
import { DialogService } from '../../shared/services/dialog.service';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { ScrollService } from '../../shared/services/scroll.service';
import { StatementFiltersComponent } from './components/statement-filters/statement-filters.component';
import { TableComponent, TableColumn } from '../../shared/components/ui/table/table.component';
import { DropdownMenuComponent, type DropdownOption } from '../../shared/components/ui/dropdown-menu/dropdown-menu.component';
import { PaginationComponent } from '../../shared/components/ui/pagination/pagination.component';
import { DialogComponent } from '../../shared/components/ui/dialog/dialog.component';
import { NewTransactionDialogComponent } from './dialogs/new-transaction-dialog/new-transaction-dialog.component';
import { UpdatePatrimonyDialogComponent } from './dialogs/update-patrimony-dialog/update-patrimony-dialog.component';
import { RemoveConfirmationDialogComponent } from './dialogs/remove-confirmation-dialog/remove-confirmation-dialog.component';
import { Transaction } from '../../domains/statement/models/transaction.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

enum DialogType {
  TRANSACTION = 'transaction',
  PATRIMONY = 'patrimony',
  REMOVAL = 'removal'
}

@Component({
  selector: 'app-statement',
  standalone: true,
  imports: [CommonModule, TableComponent, DropdownMenuComponent, PaginationComponent, DialogComponent, NewTransactionDialogComponent, UpdatePatrimonyDialogComponent, RemoveConfirmationDialogComponent, StatementFiltersComponent],
  templateUrl: './statement.component.html'
})
export class StatementComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  protected statementService = inject(StatementService);
  private searchService = inject(StatementSearchService);
  protected dialogService = inject(DialogService);
  private errorHandler = inject(ErrorHandlerService);
  private scrollService = inject(ScrollService);

  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;
  @ViewChild(StatementFiltersComponent) filtersComponent!: StatementFiltersComponent;

  private columnsSignal = signal<TableColumn[]>([]);
  columns = this.columnsSignal.asReadonly();
  currentPage = signal(1);
  itemsPerPage = signal(10);
  transactionToEdit = signal<Partial<Transaction> | null>(null);
  transactionToUpdatePatrimony = signal<Partial<Transaction> | null>(null);
  transactionToRemove = signal<Partial<Transaction> | null>(null);

  ngOnInit() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.searchService.restoreFromQueryParams(params);

        this.currentPage.set(this.searchService.page());
        this.itemsPerPage.set(this.searchService.limit());

        this.search();
      });
  }

  ngAfterViewInit() {
    const filters = this.searchService.filters();
    if (this.filtersComponent) {
      this.filtersComponent.patchFormValues({
        nome: filters.nome || '',
        codigoTipo: filters.codigoTipo ? String(filters.codigoTipo) : ''
      });
    }

    this.setupColumns();
  }

  private setupColumns(): void {
    this.columnsSignal.set([
      {
        label: 'Código de negociação',
        key: 'codigo',
        sortable: true,
        getCellClass: () => 'font-bold'
      },
      { label: 'Data', key: 'data', sortable: true },
      { label: 'Tema', key: 'tema', sortable: true },
      { label: 'Categoria', key: 'nome', sortable: true },
      {
        label: 'Patrimônio Liquido',
        key: 'patrimonio',
        sortable: true
      },
      {
        label: 'Ações',
        key: 'acoes',
        sortable: false,
        cellTemplate: this.actionsTemplate
      }
    ]);
  }

  onColumnSort(column: TableColumn): void {
    this.searchService.applySort(column.key);
    this.search();
  }

  search(filters?: { nome?: string; codigoTipo?: string }): void {
    if (filters) {
      this.searchService.applyFilters(filters);
    }

    this.searchService.setPage(this.currentPage());
    this.searchService.setLimit(this.itemsPerPage());

    const apiFilters = this.searchService.queryParams();
    this.statementService.fetchTransactions(apiFilters);

    this.updateUrl();
  }

  onSearch(filters: { nome?: string; codigoTipo?: string }): void {
    this.search(filters);
  }

  private refetchData(): void {
    this.currentPage.set(1);
    this.searchService.setPage(1);

    const apiFilters = this.searchService.queryParams();
    this.statementService.fetchTransactions(apiFilters);

    this.updateUrl();
  }

  private updateUrl(): void {
    const queryParams = this.searchService.queryParams();
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : null
    });
  }

  onClear(): void {
    if (this.filtersComponent) {
      this.filtersComponent.reset();
    }
    this.searchService.clear();
    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {}
    });
    this.statementService.clearTransactions();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.searchService.setPage(page);
    this.search();
    this.scrollService.scrollToTop();
  }

  get totalPages(): number {
    return Math.ceil(this.statementService.totalItems() / this.itemsPerPage());
  }

  onNewTransactionCreated(transaction: Partial<Transaction>): void {
    const isEdit = this.transactionToEdit() !== null;
    const action$ = isEdit
      ? this.statementService.updateTransaction(this.transactionToEdit()!.codigo!, transaction)
      : this.statementService.createTransaction(transaction as Transaction);

    this.executeTransactionAction(
      action$,
      isEdit ? 'Erro ao atualizar transação. Tente novamente.' : 'Erro ao criar transação. Tente novamente.',
      DialogType.TRANSACTION
    );
  }

  onPatrimonyUpdated(newPatrimonio: number): void {
    const codigo = this.transactionToUpdatePatrimony()?.codigo;
    if (!codigo) {
      this.closeDialog(DialogType.PATRIMONY);
      this.errorHandler.show('Erro ao atualizar patrimônio. Código não encontrado.');
      return;
    }

    this.executeTransactionAction(
      this.statementService.updateTransactionPatrimony(codigo, newPatrimonio),
      'Erro ao atualizar patrimônio. Tente novamente.',
      DialogType.PATRIMONY
    );
  }

  onRemovalConfirmed(): void {
    const codigo = this.transactionToRemove()?.codigo;
    if (!codigo) {
      this.closeDialog(DialogType.REMOVAL);
      this.errorHandler.show('Erro ao remover transação. Código não encontrado.');
      return;
    }

    this.executeTransactionAction(
      this.statementService.deleteTransaction(codigo),
      'Erro ao remover transação. Tente novamente.',
      DialogType.REMOVAL
    );
  }

  onActionSelected(option: DropdownOption, row: Transaction): void {
    switch (option.id) {
      case 'edit':
        this.openDialog(DialogType.TRANSACTION, row);
        break;
      case 'remove':
        this.openDialog(DialogType.REMOVAL, row);
        break;
      case 'update-patrimony':
        this.openDialog(DialogType.PATRIMONY, row);
        break;
    }
  }

  onTransactionDialogCancelled(): void {
    this.closeDialog(DialogType.TRANSACTION);
  }

  onPatrimonyDialogCancelled(): void {
    this.closeDialog(DialogType.PATRIMONY);
  }

  onRemovalDialogCancelled(): void {
    this.closeDialog(DialogType.REMOVAL);
  }

  private openDialog(type: DialogType, data: Partial<Transaction>): void {
    switch (type) {
      case DialogType.TRANSACTION:
        this.transactionToEdit.set(data);
        break;
      case DialogType.PATRIMONY:
        this.transactionToUpdatePatrimony.set(data);
        break;
      case DialogType.REMOVAL:
        this.transactionToRemove.set(data);
        break;
    }
    this.dialogService.open();
  }

  private closeDialog(type: DialogType): void {
    this.dialogService.close();
    switch (type) {
      case DialogType.TRANSACTION:
        this.transactionToEdit.set(null);
        break;
      case DialogType.PATRIMONY:
        this.transactionToUpdatePatrimony.set(null);
        break;
      case DialogType.REMOVAL:
        this.transactionToRemove.set(null);
        break;
    }
  }

  private executeTransactionAction(
    action$: any,
    errorMessage: string,
    dialogType: DialogType
  ): void {
    action$.subscribe({
      next: () => {
        this.closeDialog(dialogType);
        this.refetchData();
      },
      error: (error: any) => {
        this.closeDialog(dialogType);
        this.errorHandler.handleApiError(error, errorMessage);
      }
    });
  }
}
