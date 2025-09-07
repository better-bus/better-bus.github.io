import { Component, inject, model } from '@angular/core';
import { BusService } from '../bus.service';
import { TransportationPlanService } from '../transportation-plan.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bus-step',
  imports: [FormsModule, RouterLink],
  template: `
    <div>
      <h3>Select a Bus</h3>
      <button (click)="startNewBus()">New Bus</button>
      <div class="bus-list">
        @for (bus of busService.buses(); track bus.number) {
          <div class="bus-list-item" style="justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: .5rem;">
              <input type="radio" [checked]="planService.currentPlan()?.bus?.number === bus.number" (change)="selectBusForPlan(bus)" />
              <span>
                Bus #{{ bus.number }} ({{ bus.rows }} rows @if (bus.shortRearBench) {<span>— Short rear bench</span>})
              </span>
              <button (click)="editBus(bus)">Edit</button>
            </div>
          </div>
        } @empty {
          <li>No buses found. Please create a bus.</li>
        }
      </div>
      @if (showBusForm()) {
        <form (submit)="saveBus()" class="bus-form">
          <label>Number:
            <input [(ngModel)]="busNumber" name="busNumber" required />
          </label>
          <label>Rows:
            <input [(ngModel)]="busRows" name="busRows" type="number" required />
          </label>
          <div class="bus-checkbox-row">
            <input type="checkbox" [(ngModel)]="busShortRearBench" name="busShortRearBench" id="busShortRearBench" />
            <label for="busShortRearBench">Last row has short bench</label>
          </div>
          <div class="bus-form-buttons">
            <button type="submit">Save</button>
            <button type="button" (click)="cancelBusForm()">Cancel</button>
          </div>
        </form>
      }
      <div class="wizard-next-btn">
        <button [routerLink]="['../schools']">Next</button>
      </div>
    </div>
  `,
  styles: `
    .bus-form {
      max-width: 400px;
      padding: .5rem;
      outline: 1px solid var(--color-border);
      border-radius: .5rem;
      margin-block: 1rem;
    }
    .bus-checkbox-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: .5rem;
    }
    .bus-list {
      margin-top: 1rem;
    }
    .bus-form-buttons {
      display: flex;
      gap: .5rem;
      margin-top: .5rem;
    }
  `
})
export class BusStepComponent {
  readonly busService = inject(BusService);
  readonly planService = inject(TransportationPlanService);

  readonly showBusForm = model(false);
  readonly selectedBus = model<any | null>(null);

  readonly busNumber = model<string | null>(null);
  readonly busRows = model<number>(10);
  readonly busShortRearBench = model<boolean>(false);

  selectBus(bus: any) {
    this.selectedBus.set(bus);
    this.populateEditForm(bus);
    this.showBusForm.set(true);
  }

  startNewBus() {
    this.selectedBus.set(null);
    this.populateEditForm();
    this.showBusForm.set(true);
  }

  saveBus() {
    const bus = {
      number: this.busNumber() ?? '',
      rows: this.busRows(),
      shortRearBench: this.busShortRearBench()
    };
    if (this.selectedBus()) {
      this.busService.updateBus(bus);
      const plan = this.planService.currentPlan();
      if (plan && plan.bus && plan.bus.number === bus.number) {
        this.planService.updatePlan({ ...plan, bus });
      }
    } else {
      this.busService.addBus(bus);
    }
    this.showBusForm.set(false);
    this.selectedBus.set(null);
    this.populateEditForm();
  }

  cancelBusForm() {
    this.showBusForm.set(false);
    this.selectedBus.set(null);
    this.populateEditForm();
  }

  selectBusForPlan(bus: any) {
    const plan = this.planService.currentPlan();
    if (plan) {
      this.planService.updatePlan({ ...plan, bus });
    }
    this.selectedBus.set(null);
    this.showBusForm.set(false);
  }

  editBus(bus: any) {
    this.selectedBus.set(bus);
    this.populateEditForm(bus);
    this.showBusForm.set(true);
  }

  private populateEditForm(bus?: any) {
    this.busNumber.set(bus?.number ?? null);
    this.busRows.set(bus?.rows ?? 10);
    this.busShortRearBench.set(bus?.shortRearBench ?? false);
  }
}
