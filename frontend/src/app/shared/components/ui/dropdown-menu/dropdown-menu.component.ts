import { Component, input, output, HostListener, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export type IconName = 'logo' | 'person' | 'more' | 'edit' | 'delete' | 'sort' | 'money' | 'arrow-left' | 'arrow-right' | 'double-arrow-left' | 'double-arrow-right';

export interface DropdownOption {
  id: string | number;
  label: string;
  icon?: IconName;
}

@Component({
  selector: 'app-dropdown-menu',
  imports: [CommonModule, IconComponent],
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.css'
})
export class DropdownMenuComponent implements AfterViewInit {
  options = input<DropdownOption[]>([]);
  triggerLabel = input<IconName>('more');
  optionSelected = output<DropdownOption>();
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  @ViewChild('triggerButton') triggerButton!: ElementRef;

  isOpen = false;
  dropdownPosition = { top: '0px', left: '0px' };

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    if (this.triggerButton) {
      this.updateDropdownPosition();
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.cdr.detectChanges();
      this.updateDropdownPosition();
    }
  }

  private updateDropdownPosition() {
    if (!this.triggerButton) return;

    const rect = this.triggerButton.nativeElement.getBoundingClientRect();
    const dropdownWidth = 200;
    const padding = 16;
    let left = rect.right - dropdownWidth;

    if (left + dropdownWidth + padding > window.innerWidth) {
      left = window.innerWidth - dropdownWidth - padding;
    }

    if (left < padding) {
      left = padding;
    }

    this.dropdownPosition = {
      top: (rect.bottom + 8) + 'px',
      left: left + 'px'
    };
  }

  selectOption(option: DropdownOption) {
    this.optionSelected.emit(option);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isClickInside = target.closest('app-dropdown-menu');
    if (!isClickInside) {
      this.isOpen = false;
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.isOpen) {
      this.updateDropdownPosition();
    }
  }
}
