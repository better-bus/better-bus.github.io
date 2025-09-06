import { Component, computed, inject } from '@angular/core';
import { TransportationPlanService } from './transportation-plan.service';
import { ActivatedRoute } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-transportation-plan-wizard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="wizard">
      <nav class="wizard-nav">
        <a class="nav-btn" [routerLink]="['name']" routerLinkActive="active">Name</a>
        <a class="nav-btn" [routerLink]="['bus']" routerLinkActive="active">Bus</a>
        <a class="nav-btn" [routerLink]="['school']" routerLinkActive="active">School & Grade</a>
        <a class="nav-btn" [routerLink]="['stop']" routerLinkActive="active">Stop</a>
        <a class="nav-btn" [routerLink]="['route']" routerLinkActive="active">Route & Schedule</a>
        <a class="nav-btn" [routerLink]="['student']" routerLinkActive="active">Student</a>
        <a class="nav-btn" [routerLink]="['seating']" routerLinkActive="active">Seating</a>
      </nav>

      <article>
        <router-outlet></router-outlet>
      </article>
    </div>
  `,
  styles: []
})
export class TransportationPlanWizardComponent {
  readonly planService = inject(TransportationPlanService);
  readonly route = inject(ActivatedRoute);
  readonly plan = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.planService.plans().find(p => p.id === id);
  });
}
