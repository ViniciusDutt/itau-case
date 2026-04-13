import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type ButtonVariant = 'default' | 'outline' | 'ghost';
type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  imports: [NgClass],
  templateUrl: './button.component.html'
})
export class ButtonComponent {
  variant = input<ButtonVariant>('default');
  disabled = input<boolean>(false);
  type = input<ButtonType>('button');
}
