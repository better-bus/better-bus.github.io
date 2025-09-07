import { Component, computed, inject } from '@angular/core';
import { TransportationPlanService } from './transportation-plan.service';
import { ActivatedRoute } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { plansRoute } from '../app.routes';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-transportation-plan-wizard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TitleCasePipe],
  template: `
    <div class="wizard">
      <nav class="wizard-nav">
        @for (page of childPages; track page.path) {
          <a class="nav-btn" [routerLink]="[page.path]" routerLinkActive="active">{{ (page.data?.['displayName'] ?? page.path) | titlecase }}</a>
        }
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

  readonly childPages = plansRoute.children!.filter(r => r.component);

  readonly plan = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.planService.plans().find(p => p.id === id);
  });
}
