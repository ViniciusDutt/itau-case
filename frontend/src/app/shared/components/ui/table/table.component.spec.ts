import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent, TableColumn } from './table.component';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  interface TestData {
    id: string;
    name: string;
    status: string;
  }

  const mockData: TestData[] = [
    { id: '1', name: 'Item 1', status: 'active' },
    { id: '2', name: 'Item 2', status: 'inactive' }
  ];

  const mockColumns: TableColumn<TestData>[] = [
    { label: 'ID', key: 'id', sortable: true },
    { label: 'Name', key: 'name', sortable: false },
    {
      label: 'Status',
      key: 'status',
      getCellClass: (row) => row.status === 'active' ? 'active' : 'inactive'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render data rows', () => {
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should render column headers', () => {
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.detectChanges();

    const headers = fixture.nativeElement.querySelectorAll('thead th');
    expect(headers.length).toBe(3);
    expect(headers[0].textContent).toContain('ID');
  });

  it('should call onSort when sortable column is clicked', () => {
    const sortCallback = jest.fn();
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('onSort', sortCallback);
    fixture.detectChanges();

    const sortableHeader = fixture.nativeElement.querySelector('thead th:first-child');
    sortableHeader?.click();

    expect(sortCallback).toHaveBeenCalled();
  });

  it('should apply custom cell classes', () => {
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.detectChanges();

    const activeCell = fixture.nativeElement.querySelector('tbody tr:first-child td:last-child');
    expect(activeCell.classList.contains('active')).toBe(true);
  });

  it('should handle empty data', () => {
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1); // Shows empty state message row
    expect(rows[0].textContent).toContain('Nenhum registro encontrado');
  });

  it('should update on data changes', () => {
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.detectChanges();

    fixture.componentRef.setInput('data', [mockData[0]]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
  });
});
