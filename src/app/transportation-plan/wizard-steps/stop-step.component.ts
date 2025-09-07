import { Component, inject, effect, model, signal } from '@angular/core';
import { Stop, SideOfStreet } from '../../models';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TransportationPlanService } from '../transportation-plan.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-stop-step',
  template: `
    <h2>Stops</h2>
    <button type="button" (click)="startAdd()">Add Stop</button>

    @if (editingStop()) {
      <form (ngSubmit)="saveStop()">
        <div>
          <label>ID:</label>
          <input [(ngModel)]="id" name="id" required (input)="saveStop()" />
        </div>
        <div>
          <label>Address:</label>
          <input [(ngModel)]="address" name="address" required (input)="saveStop()" />
        </div>
        <div>
          <label>Nickname (optional):</label>
          <input [(ngModel)]="name" name="name" required (input)="saveStop()" />
        </div>
        <div>
          <label>Location (lat,lng):</label>
          <input [(ngModel)]="location" name="location" required (input)="saveStop()" />
        </div>
        <div>
          <label>Side of Street (optional):</label>
          <p class="instructions">What side(s) of the street can students safely be picked up or dropped off on?</p>
          <div class="sides">
            @for (side of sideOptions; track side) {
              <label style="display: inline-flex; align-items: center; gap: 0.25rem;">
                <input type="checkbox"
                  [checked]="sideOfStreet().includes(side)"
                  (change)="toggleSideForm(side, $event.target.checked); saveStop()" />
                {{ side | titlecase }}
              </label>
            }
          </div>
        </div>
        <div>
          <label style="display: inline-flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" [(ngModel)]="curbside" name="curbside" (change)="saveStop()" />
            Curbside
          </label>
        </div>
        <div>
          <label>Notes:</label>
          <textarea [(ngModel)]="notes" name="notes" rows="2" (input)="saveStop()"></textarea>
        </div>
        <div class="actions">
          <button (click)="cancelEdit()">Done</button>
        </div>
      </form>
    }

    <ul>
      @for (stop of stops(); track stop.id; let i = $index) {
        <li>
          <span>
            <strong>{{ stop.id }}</strong>
            @if(stop.nickname) {
              ({{ stop.nickname }})
            }
            @if(stop.curbside) {
              <strong> - CURBSIDE</strong>
            }
            <br />
            {{ stop.address }}<br />
            Location: {{ stop.location.join(',') }}<br />
            Side(s): {{ stop.sideOfStreet.join(', ') }}<br />
            @if (stop.notes) {
              <span>Notes: {{ stop.notes }}</span>
            }
          </span>
          <button type="button" (click)="editStop(i)">Edit</button>
          <button type="button" (click)="removeStop(i)">Delete</button>
          <button type="button" (click)="moveUp(i)" [disabled]="i === 0">↑</button>
          <button type="button" (click)="moveDown(i)" [disabled]="i === stops().length - 1">↓</button>
        </li>
      } @empty {
        <li>No stops added yet.</li>
      }
    </ul>
    <button class="wizard-next-btn" [routerLink]="['../routes']">Next</button>
  `,
  styles: `
    .sides {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
  `,
  imports: [FormsModule, RouterLink, TitleCasePipe]
})
export class StopStepComponent {
  readonly planService = inject(TransportationPlanService);
  readonly stops = model<Stop[]>([]);
  readonly name = model('');
  readonly id = model('');
  readonly address = model('');
  readonly location = model('');
  readonly sideOfStreet = model<SideOfStreet[]>([]);
  readonly notes = model('');
  readonly curbside = model(false);

  readonly editingStop = signal<Partial<Stop> | null>(null);

  constructor() {
    // On initialization, always load stops from the persisted plan in the plans array
    effect(() => {
      const plan = this.planService.currentPlan();
      if (plan && Array.isArray(plan.stops)) {
        this.stops.set(plan.stops.map(s => ({ ...s })));
      } else {
        this.stops.set([]);
      }
    });
  }

  startAdd() {
    this.editingStop.set({});
    this.name.set('');
    this.id.set('');
    this.address.set('');
    this.location.set('');
    this.sideOfStreet.set([]);
    this.curbside.set(false);
    this.notes.set('');
  }

  editStop(index: number) {
    const stop = this.stops()[index];
    this.editingStop.set(stop);
    this.name.set(stop.nickname);
    this.id.set(stop.id);
    this.address.set(stop.address);
    this.location.set(stop.location.join(','));
    this.sideOfStreet.set([...stop.sideOfStreet]);
    this.curbside.set(!!stop.curbside);
    this.notes.set(stop.notes ?? '');
  }

  cancelEdit() {
    this.editingStop.set(null);
    this.name.set('');
    this.id.set('');
    this.address.set('');
    this.location.set('');
    this.sideOfStreet.set([]);
    this.curbside.set(false);
    this.notes.set('');
  }

  saveStop() {
    const locStr = this.location();
    let latitude = 0, longitude = 0;
    if (locStr) {
      const parts = locStr.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        latitude = parts[0];
        longitude = parts[1];
      }
    }
    const stopObj: Stop = {
      id: this.id(),
      nickname: this.name(),
      address: this.address(),
      location: [latitude, longitude],
      sideOfStreet: [...this.sideOfStreet()],
      curbside: this.curbside(),
      notes: this.notes(),
    };
    if (!stopObj.id || !stopObj.address) {
      return;
    }
    // If editingStop is null or stop does not exist, add new stop; otherwise, update existing
    const index = this.stops().findIndex(s => s.id === this.id());
    if (index === -1) {
      this.stops.update(arr => [...arr, stopObj]);
    } else {
      this.stops.update(arr => arr.map((s, i) => i === index ? stopObj : s));
    }
    // Always update the plan in the plans array and persist
    const plan = this.planService.currentPlan();
    if (plan) {
      const updatedPlan = { ...plan, stops: this.stops().map(s => ({ ...s })) };
      this.planService.updatePlan(updatedPlan);
      this.stops.set(updatedPlan.stops.map(s => ({ ...s })));
    }
  }

  toggleSideForm(side: SideOfStreet, checked: boolean) {
    const current = this.sideOfStreet();
    if (checked) {
      if (!current.includes(side)) {
        this.sideOfStreet.set([...current, side]);
      }
    } else {
      this.sideOfStreet.set(current.filter(s => s !== side));
    }
  }

  removeStop(index: number) {
    this.stops.update((arr: Stop[]) => arr.filter((_, i) => i !== index));
    const plan = this.planService.currentPlan();
    if (plan) {
      const updatedPlan = { ...plan, stops: this.stops().map(s => ({ ...s })) };
      this.planService.updatePlan(updatedPlan);
      this.stops.set(updatedPlan.stops.map(s => ({ ...s })));
    }
  }

  moveUp(index: number) {
    this.stops.update((arr: Stop[]) => {
      if (index > 0) {
        const newArr = [...arr];
        [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
        return newArr;
      }
      return arr;
    });
    const plan = this.planService.currentPlan();
    if (plan) {
      const updatedPlan = { ...plan, stops: this.stops().map(s => ({ ...s })) };
      this.planService.updatePlan(updatedPlan);
      this.stops.set(updatedPlan.stops.map(s => ({ ...s })));
    }
  }

  moveDown(index: number) {
    this.stops.update((arr: Stop[]) => {
      if (index < arr.length - 1) {
        const newArr = [...arr];
        [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
        return newArr;
      }
      return arr;
    });
    const plan = this.planService.currentPlan();
    if (plan) {
      const updatedPlan = { ...plan, stops: this.stops().map(s => ({ ...s })) };
      this.planService.updatePlan(updatedPlan);
      this.stops.set(updatedPlan.stops.map(s => ({ ...s })));
    }
  }

  sideOptions: SideOfStreet[] = [
    'north', 'south', 'east', 'west', 'northeast', 'southeast', 'southwest', 'northwest'
  ];

  toggleSide(stop: Stop, side: SideOfStreet, checked: boolean) {
    if (checked) {
      if (!stop.sideOfStreet.includes(side)) {
        stop.sideOfStreet = [...stop.sideOfStreet, side];
      }
    } else {
      stop.sideOfStreet = stop.sideOfStreet.filter(s => s !== side);
    }
  }
}
