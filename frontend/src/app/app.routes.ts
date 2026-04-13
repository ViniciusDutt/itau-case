import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component')
        .then(m => m.DashboardLayoutComponent),

    children: [
      {
        path: '',
        title: 'Início - Itaú Case',
        loadComponent: () =>
          import('./features/home/home.component')
            .then(m => m.HomeComponent)
      },
      {
        path: 'ativos',
        title: 'Carteira de Ativos - Itaú Case',
        loadComponent: () =>
          import('./features/statement/statement.component')
            .then(m => m.StatementComponent)
      }
    ]
  }
];
