import { Component, input } from '@angular/core';
import { TransportationPlan } from '../models';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-transportation-plan-card',
  imports: [RouterLink, DatePipe],
  template: `
  <article [routerLink]="['/plans', plan().id, 'name']">
      <h2>{{ plan().name || '(Untitled Plan)' }}</h2>
      @if (plan().description; as description) {
        <p>{{ description }}</p>
      }
      @if (plan().bus; as bus) {
        <div>Bus #: {{ bus.number }}</div>
      }
      @if (plan().stops.length) {
        <div>{{ plan().stops.length }} stops</div>
      }
      @if (plan().students; as students) {
        <div>{{ students.length }} students</div>
      }
      <div>Last Updated: {{ plan().updatedAt | date }}</div>
      <div class="actions">
        <!-- TODO: Implement these actions -->
        <!-- <button><i class="fas fa-trash"></i></button>
        <button><i class="fas fa-copy"></i></button>
        <button><i class="fas fa-eye"></i></button> -->
        @if (!plan().seatAssignments.length) {
          <button [routerLink]="['/plans', plan().id, 'seating']">
            <i class="fas fa-chair"></i> Seats
          </button>
        }
      </div>
  </article>
  `,
  styles: `
    article {
      cursor: pointer;
    }
    article:hover {
      background: #f9f9f9;
    }
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
