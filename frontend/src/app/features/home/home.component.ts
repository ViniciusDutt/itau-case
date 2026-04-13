import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FundsSummaryService } from '../../domains/funds/services/funds-summary.service';
import { SummaryCardComponent } from './components/summary-card.component';
import { SummaryCardSkeletonComponent } from './components/summary-card-skeleton.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, SummaryCardComponent, SummaryCardSkeletonComponent, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private fundsSummaryService = inject(FundsSummaryService);
  public summary = this.fundsSummaryService.summary;
  public loading = this.fundsSummaryService.loading;
  public error = this.fundsSummaryService.error;

  ngOnInit(): void {
    this.fundsSummaryService.fetchSummary();
  }
}

