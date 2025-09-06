import { Component, inject, model } from '@angular/core';
import { effect } from '@angular/core';
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
      @if (errorMsg) {
        <div style="color: red; margin-top: 1em;">{{ errorMsg }}</div>
      }
    </div>
  `
})
export class NameStepComponent {
  readonly planService = inject(TransportationPlanService);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly planName = model('');
  readonly planDescription = model('');

  constructor() {
    let id = this.route.snapshot.paramMap.get('id');
    if (!id && this.route.parent) {
      id = this.route.parent.snapshot.paramMap.get('id');
    }
    effect(() => {
      const plan = this.planService.plans().find(p => p.id === id);
      if (plan) {
        this.planName.set(plan.name ?? '');
        this.planDescription.set(plan.description ?? '');
      }
    });
  }
  errorMsg = '';

  saveName() {
    let id = this.route.snapshot.paramMap.get('id');
    if (!id && this.route.parent) {
      id = this.route.parent.snapshot.paramMap.get('id');
    }
    const plan = this.planService.plans().find(p => p.id === id);
    console.log('saveName called', { id, plan, planName: this.planName(), planDescription: this.planDescription() });
    if (plan && this.planName().trim()) {
      plan.name = this.planName().trim();
      plan.description = this.planDescription().trim();
      this.planService.updatePlan(plan);
      this.router.navigate(['../bus'], { relativeTo: this.route });
    } else {
      this.errorMsg = !plan ? 'Plan not found.' : 'Please enter a valid name.';
    }
  }
}
