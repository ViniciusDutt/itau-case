import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-dashboard-layout',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {

}
