import { Component, inject, model } from '@angular/core';
import { BusService } from '../bus.service';
import { TransportationPlanService } from '../transportation-plan.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bus-step',
  imports: [FormsModule],
  template: `
    <div>
      <h3>Select a Bus</h3>
      <ul>
        @for (bus of busService.buses(); track bus.number) {
          <li (click)="selectBus(bus)">
            Bus #{{ bus.number }} ({{ bus.rows }} rows, {{ bus.ridersPerBench }} riders/bench)
          </li>
        } @empty {
          <li>No buses found.</li>
        }
      </ul>
  <button class="btn" (click)="showNewBusForm.set(!showNewBusForm())">Create New Bus</button>
      @if (showNewBusForm()) {
        <h4>New Bus</h4>
        <form (submit)="createBus()">
          <label>Number: <input [(ngModel)]="newBusNumber" type="number" required></label><br>
          <label>Rows: <input [(ngModel)]="newBusRows" type="number" required></label><br>
          <label>Riders/Bench: <input [(ngModel)]="newBusRidersPerBench" type="number" required></label><br>
          <button type="submit" class="btn">Save Bus</button>
        </form>
      }
    </div>
  `
})
export class BusStepComponent {
  readonly busService = inject(BusService);
  readonly planService = inject(TransportationPlanService);
  readonly showNewBusForm = model(false);
  readonly newBusNumber = model(0);
  readonly newBusRows = model(0);
  readonly newBusRidersPerBench = model(0);

  selectBus(bus: any) {
    // Assign selected bus to current plan
    // ...implementation depends on plan context...
  }

  createBus() {
    this.busService.addBus({
      number: this.newBusNumber(),
      rows: this.newBusRows(),
      ridersPerBench: this.newBusRidersPerBench()
    });
    this.showNewBusForm.set(false);
    this.newBusNumber.set(0);
    this.newBusRows.set(0);
    this.newBusRidersPerBench.set(0);
  }
}
