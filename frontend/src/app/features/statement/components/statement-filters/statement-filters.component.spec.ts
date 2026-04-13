import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ReactiveFormsModule } from '@angular/forms';
import { StatementFiltersComponent } from './statement-filters.component';
import { FundTypeService } from '../../../../domains/statement/services/fund-type.service';
import { signal } from '@angular/core';

describe('StatementFiltersComponent', () => {
  let component: StatementFiltersComponent;
  let fixture: ComponentFixture<StatementFiltersComponent>;

  const mockFundTypes = [
    { codigo: 'FI001', nome: 'Fundo' },
    { codigo: 'FI002', nome: 'Ação' }
  ];

  beforeEach(async () => {
    const mockFundTypeService = { fundTypes: signal(mockFundTypes) };

    await TestBed.configureTestingModule({
      imports: [StatementFiltersComponent, ReactiveFormsModule],
      providers: [{ provide: FundTypeService, useValue: mockFundTypeService }]
    }).compileComponents();

    fixture = TestBed.createComponent(StatementFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate nome field with minimum 3 characters', () => {
    const control = component.filterForm.get('nome');
    control?.enable({ emitEvent: false });
    control?.setValue('ab');
    expect(control?.hasError('minlength')).toBe(true);
    control?.setValue('abc');
    expect(control?.valid).toBe(true);
  });

  it('should emit search event with valid filters', () => {
    jest.spyOn(component.search, 'emit');
    component.filterForm.get('nome')?.enable({ emitEvent: false });
    component.filterForm.get('codigoTipo')?.enable({ emitEvent: false });
    component.filterForm.patchValue({ nome: 'Test Fund', codigoTipo: 'FI001' });
    component.onSubmit();
    expect(component.search.emit).toHaveBeenCalledWith({
      nome: 'Test Fund',
      codigoTipo: 'FI001'
    });
  });

  it('should not emit if form is invalid', () => {
    jest.spyOn(component.search, 'emit');
    component.filterForm.get('nome')?.enable({ emitEvent: false });
    component.filterForm.patchValue({ nome: 'ab' });
    component.onSubmit();
    expect(component.search.emit).not.toHaveBeenCalled();
  });

  it('should reset form on clear', () => {
    jest.spyOn(component.clear, 'emit');
    component.filterForm.get('nome')?.enable({ emitEvent: false });
    component.filterForm.patchValue({ nome: 'Test' });
    component.onClear();
    expect(component.filterForm.get('nome')?.value).toBeFalsy(); // reset returns null or empty string
    expect(component.clear.emit).toHaveBeenCalled();
  });

  it('should emit newTransaction event', () => {
    jest.spyOn(component.newTransaction, 'emit');
    component.onNewClick();
    expect(component.newTransaction.emit).toHaveBeenCalled();
  });
});
