import { Component, input } from '@angular/core';
import { TransportationPlan } from '../models';
import { TransportationPlanCardComponent } from './transportation-plan-card.component';


@Component({
  selector: 'app-transportation-plan-list',
  imports: [TransportationPlanCardComponent],
  template: `
    <div class="plan-list">
      @for (plan of plans(); track plan.id) {
        <app-transportation-plan-card [plan]="plan"></app-transportation-plan-card>
      } @empty {
        <div>No transportation plans found.</div>
      }
    </div>
  `,
  styles: []
})
export class TransportationPlanListComponent {
  readonly plans = input.required<TransportationPlan[]>();
}
