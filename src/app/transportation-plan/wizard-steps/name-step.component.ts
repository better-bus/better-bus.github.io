import { Component, inject, model, signal, effect } from '@angular/core';
import { TransportationPlanService } from '../transportation-plan.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-name-step',
  imports: [FormsModule],
  template: `
    <div>
      <h3>Name Your Transportation Plan</h3>
      <form (submit)="saveName()">
        <label>Plan Name:
            <input [(ngModel)]="planName" name="planName" required />
        </label>
        <br>
        <label>Description:
            <textarea [(ngModel)]="planDescription" name="planDescription" rows="3" style="width:100%"></textarea>
        </label>
        <br>
  <button type="submit" class="btn">Next</button>
      </form>
      @if (errorMsg()) {
        <div style="color: red; margin-top: 1em;">{{ errorMsg() }}</div>
      }
    </div>
  `
})
export class NameStepComponent {
  readonly planService = inject(TransportationPlanService);
  readonly router = inject(Router);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly currentPlan = this.planService.currentPlan;
  readonly planName = model('');
  readonly planDescription = model('');
  readonly errorMsg = signal('');

  constructor() {
    effect(() => {
      const name = this.currentPlan()?.name ?? '';
      if (name && this.planName() !== name) {
        this.planName.set(name);
      }
    });
  }

  saveName() {
    this.errorMsg.set('');
    const plan = this.currentPlan();
    if (plan && this.planName().trim()) {
      plan.name = this.planName().trim();
      plan.description = this.planDescription().trim();
      this.planService.updatePlan(plan);
      this.router.navigate(['../bus'], { relativeTo: this.activatedRoute });
    } else {
      this.errorMsg.set(!plan ? 'Plan not found.' : 'Please enter a valid name.');
    }
  }
}
