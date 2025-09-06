import { Component, computed, inject } from '@angular/core';
import { TransportationPlanListComponent } from './transportation-plan-list.component';
import { TransportationPlanService } from './transportation-plan.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transportation-plan-page',
  imports: [TransportationPlanListComponent],
  template: `
    <div class="transportation-plan-page">
      <h1>Transportation Plans</h1>
      <button (click)="createNewPlan()">Create New Plan</button>
      <app-transportation-plan-list [plans]="plans()"></app-transportation-plan-list>
    </div>
  `,
  styles: []
})
export class TransportationPlanPageComponent {
  readonly planService = inject(TransportationPlanService);
  readonly router = inject(Router);
  readonly plans = computed(() =>
    [...this.planService.plans()].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  );

  createNewPlan() {
    const newPlan = this.planService.createNewPlan({});
    this.planService.addPlan(newPlan);
    this.router.navigate([`/plans/${newPlan.id}/school`]);
  }
}
