import { Component, input } from '@angular/core';
import { TransportationPlan } from '../models';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-transportation-plan-card',
  imports: [RouterLink, DatePipe],
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
      <div>Last Updated: {{ plan().updatedAt | date }}</div>
      <div class="actions">
        <button [routerLink]="['/plans', plan().id, 'name']">Edit</button>
        <button><i class="fas fa-trash"></i></button>
        <button><i class="fas fa-copy"></i></button>
        <button><i class="fas fa-eye"></i></button>
      </div>
  </article>
  `,
  styles: `
    .actions {
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
    }
  `
})
export class TransportationPlanCardComponent {
  readonly plan = input.required<TransportationPlan>();
}
