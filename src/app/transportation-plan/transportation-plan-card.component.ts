import { Component, input } from '@angular/core';
import { TransportationPlan } from '../models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-transportation-plan-card',
  imports: [RouterLink],
  template: `
  <article>
      <h2>{{ plan().name || '(Untitled Plan)' }}</h2>
      @if (plan().description; as description) {
        <p>{{ description }}</p>
      }
      @if (plan().bus; as bus) {
        <div>Bus #: {{ bus.number }}</div>
      }
      @if (plan().roster; as roster) {
        <div>{{ roster.studentIds.length }} students</div>
      }
      <div>Last Updated: {{ plan().updatedAt }}</div>
  <button class="btn" [routerLink]="['/plans', plan().id, 'name']">Edit</button>
  <button class="btn">Delete</button>
  <button class="btn">Duplicate</button>
  <button class="btn">View Summary</button>
  </article>
  `,
  styles: []
})
export class TransportationPlanCardComponent {
  readonly plan = input.required<TransportationPlan>();
}
