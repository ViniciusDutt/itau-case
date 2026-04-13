import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.components.html',
})
export class IconComponent {
  name = input.required<'logo' | 'person' | 'more' | 'edit' | 'delete' | 'sort' | 'money' | 'arrow-left' | 'arrow-right' | 'double-arrow-left' | 'double-arrow-right'>();
}
