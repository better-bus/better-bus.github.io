import { Component, inject, model, signal, effect } from '@angular/core';
import { TransportationPlanService } from '../transportation-plan.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-name-step',
  imports: [FormsModule, RouterLink],
  template: `
    <div>
      <h3>Name Your Transportation Plan</h3>

      <label>Plan Name:
        <input [(ngModel)]="planName" (input)="save()" name="planName" required />
      </label>
      <label>Description:
        <textarea [(ngModel)]="planDescription" (input)="save()" name="planDescription" rows="3"></textarea>
      </label>

      <button [routerLink]="['../bus']">Next</button>
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

  save() {
    this.errorMsg.set('');
    const plan = this.currentPlan();
    if (!plan) {
      return;
    }

    plan.name = this.planName().trim();
    plan.description = this.planDescription().trim();
    this.planService.updatePlan(plan);
  }
}
