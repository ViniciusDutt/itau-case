import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownMenuComponent, DropdownOption } from './dropdown-menu.component';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('DropdownMenuComponent', () => {
  let component: DropdownMenuComponent;
  let fixture: ComponentFixture<DropdownMenuComponent>;

  const mockOptions: DropdownOption[] = [
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownMenuComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start closed', () => {
    expect(component.isOpen).toBe(false);
  });

  it('should toggle dropdown open/close', () => {
    component.toggleDropdown();
    expect(component.isOpen).toBe(true);

    component.toggleDropdown();
    expect(component.isOpen).toBe(false);
  });

  it('should emit option selected and close dropdown', () => {
    jest.spyOn(component.optionSelected, 'emit');
    component.isOpen = true;

    component.selectOption(mockOptions[0]);

    expect(component.optionSelected.emit).toHaveBeenCalledWith(mockOptions[0]);
    expect(component.isOpen).toBe(false);
  });

  it('should close dropdown on outside click', () => {
    component.isOpen = true;
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', {
      value: document.createElement('div'),
      enumerable: true
    });

    component.onDocumentClick(event);

    expect(component.isOpen).toBe(false);
  });

  it('should keep dropdown open when clicking inside', () => {
    component.isOpen = true;
    const dropdownElement = fixture.nativeElement;
    const event = new MouseEvent('click');
    // Mock closest to return the dropdown element
    const closestSpy = jest.spyOn(Object.getPrototypeOf(dropdownElement), 'closest');
    closestSpy.mockReturnValue(dropdownElement);
    Object.defineProperty(event, 'target', {
      value: dropdownElement,
      enumerable: true
    });

    component.onDocumentClick(event);

    expect(component.isOpen).toBe(true);
  });

  it('should render options when opened', () => {
    fixture.componentRef.setInput('options', mockOptions);
    component.isOpen = true;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('div button');
    expect(buttons.length).toBe(mockOptions.length + 1); // +1 for trigger button
  });

  it('should update position on scroll when open', () => {
    component.isOpen = true;

    component.onWindowScroll();

    expect(component.dropdownPosition).toBeDefined();
  });
});
