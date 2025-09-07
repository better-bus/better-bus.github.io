import { Component, inject, model, effect } from '@angular/core';
import { TransportationPlanService } from '../transportation-plan.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seating-step',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <h3>Seating Assignments Step</h3>
      <form class="seating-form">
        <label>Riders per bench:
          <input [(ngModel)]="ridersPerBench" type="number" min="1" max="4" name="ridersPerBench" required />
        </label>
      </form>
    </div>
  `,
  styles: [
    `.seating-form {
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }`
  ]
})
export class SeatingStepComponent {
  readonly planService = inject(TransportationPlanService);
  readonly ridersPerBench = model<number>(this.planService.currentPlan()?.ridersPerBench ?? 2);

  constructor() {
    effect(() => {
      const val = this.ridersPerBench();
      const plan = this.planService.currentPlan();
      if (plan) {
        this.planService.updatePlan({ ...plan, ridersPerBench: val });
      }
    });
  }
}
