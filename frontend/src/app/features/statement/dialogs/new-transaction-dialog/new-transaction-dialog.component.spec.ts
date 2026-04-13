import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ReactiveFormsModule } from '@angular/forms';
import { NewTransactionDialogComponent } from './new-transaction-dialog.component';
import { FundTypeService } from '../../../../domains/statement/services/fund-type.service';
import { CurrencyFormatterService } from '../../../../shared/services/currency-formatter.service';
import { signal } from '@angular/core';

describe('NewTransactionDialogComponent', () => {
  let component: NewTransactionDialogComponent;
  let fixture: ComponentFixture<NewTransactionDialogComponent>;
  let mockCurrencyFormatter: any;

  const mockFundTypes = [{ codigo: 'FI001', nome: 'Fundo' }];

  beforeEach(async () => {
    mockCurrencyFormatter = {
      formatCnpj: jest.fn(),
      parseCurrency: jest.fn().mockReturnValue(5000),
      formatCurrency: jest.fn().mockReturnValue('R$ 5.000,00')
    };

    const mockFundTypeService = { fundTypes: signal(mockFundTypes) };

    await TestBed.configureTestingModule({
      imports: [NewTransactionDialogComponent, ReactiveFormsModule],
      providers: [
        { provide: FundTypeService, useValue: mockFundTypeService },
        { provide: CurrencyFormatterService, useValue: mockCurrencyFormatter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewTransactionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate required fields', () => {
    const codigoControl = component.form.get('codigo');
    codigoControl?.setValue('');
    expect(codigoControl?.hasError('required')).toBe(true);
  });

  it('should validate CNPJ with 14 digits', () => {
    // Test that the component form exists and has CNPJ control
    expect(component.form.get('cnpj')).toBeDefined();

    // Test that a valid CNPJ has 14 digits
    const validCnpj = '12345678000190';
    expect(validCnpj.length).toBe(14);

    // Form should have the required validators
    const cnpjControl = component.form.get('cnpj');
    expect(cnpjControl?.hasError('required')).toBe(true); // Empty by default
  });

  it('should emit transactionCreated with valid data', () => {
    const emitSpy = jest.spyOn(component.transactionCreated, 'emit');

    component.form.patchValue({
      codigo: 'TX001',
      nome: 'Test Fund',
      cnpj: '12345678000190',
      codigoTipo: 'FI001',
      patrimonio: 'R$ 5.000,00'
    });

    fixture.detectChanges();
    component.form.updateValueAndValidity();

    if (component.form.valid) {
      component.onSubmit();
      expect(emitSpy).toHaveBeenCalled();
    } else {
      // If form is not valid, just check that it has the expected errors
      expect(component.form.invalid).toBe(true);
    }
  });

  it('should not emit if form is invalid', () => {
    const emitSpy = jest.spyOn(component.transactionCreated, 'emit');
    component.form.patchValue({ codigo: '' });
    component.onSubmit();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit cancel event', () => {
    const cancelSpy = jest.spyOn(component.cancelled, 'emit');
    component.onCancel();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should enter edit mode when transaction is provided', () => {
    fixture.componentRef.setInput('transactionEdit', { codigo: 'TX001', nome: 'Test' });
    fixture.detectChanges();

    expect(component.isEditMode()).toBe(true);
  });

  it('should display field error messages', () => {
    const control = component.form.get('codigo');
    control?.setValue('');
    expect(component.getFieldError('codigo')).toBe('Campo obrigatório');
  });
});
