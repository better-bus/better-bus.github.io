import { Component, computed, inject, WritableSignal, Pipe, PipeTransform } from '@angular/core';
import { model, signal, effect } from '@angular/core';
import { TransportationPlanService } from '../transportation-plan.service';
import { Router } from '@angular/router';
import { TransportationPlan, Bus, Route, Stop, Schedule, DayOfWeek, TimeString } from '../../models';
import { nanoid } from 'nanoid';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { DatePipe } from '@angular/common';

@Pipe({ name: 'scheduleTimeRange', standalone: true })
export class ScheduleTimeRangePipe implements PipeTransform {
  transform(schedule: Schedule): [Date | null, Date | null] {
    const times = (schedule.stops ?? [])
      .map(st => st.time)
      .filter(t => t)
      .map(t => new Date(`1970-01-01T${t}:00`))
      .sort((a, b) => {
        return a.getTime() - b.getTime();
      });
    return [times.at(0) ?? null, times.at(-1) ?? null];
  }
}

@Component({
  selector: 'app-route-schedule-step',
  imports: [FormsModule, RouterLink, ScheduleTimeRangePipe, DatePipe],
  template: `
    <h2>Route Schedules</h2>
    <button (click)="addSchedule()">New Schedule</button>
    @if (editingSchedule()) {
    <form>
      <label>Schedule Name
        <input name="scheduleName" [(ngModel)]="scheduleName" (input)="save()" />
      </label>
      <label>
        Schedule Type
        <select name="stopType" [(ngModel)]="stopTypes" (input)="save()">
          <option name="pickUp" value="pick up">Pick Up</option>
          <option name="dropOff" value="drop off">Drop Off</option>
        </select>
      </label>
      <div>
        <label>Days of the Week:</label>
        <div class="days-list">
          @for (ds of daySettings(); track ds.day) {
            <label style="margin-right:1rem;">
              <input type="checkbox"
                [name]="ds.day"
                [(ngModel)]="ds.selected"
                (change)="save()" />
              {{ ds.day }}
            </label>
          }
        </div>
      </div>
      <div>
        <h3>Stop Times</h3>
        <div class="stops-list">
          @for (st of sortedStopTimes(); track st.stop) {
            <div>
              <label [title]="st.stop.address">
                Stop {{ st.stop.id }}
                @if (st.stop.nickname) {
                  ({{ st.stop.nickname }})
                }
              </label>
              <input name="time-{{st.stop.id}}" type="time" [(ngModel)]="st.time" (input)="save()" />
            </div>
          }
        </div>
      </div>
  <button (click)="save(); editingSchedule.set(null)">Done</button>
    </form>
    }

    <ul>
      @for (schedule of schedules(); track schedule.name) {
        <li>
          <strong>{{ schedule.name }}</strong>
          - {{ (schedule | scheduleTimeRange)[0] | date: 'shortTime' }}
          - {{ (schedule | scheduleTimeRange)[1] | date: 'shortTime' }}
          - {{ schedule.days.join(', ') }}
          <button (click)="editSchedule(schedule)">Edit</button>
          <button (click)="removeSchedule(schedule.name)">Remove</button>
        </li>
      }
      @empty {
        <li>No schedules added yet.</li>
      }
    </ul>
    <button [routerLink]="['../students']">Next</button>
  `,
  styles: `
    .stops-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .days-list {
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
  `
})
export class RouteScheduleStepComponent {
  readonly planService = inject(TransportationPlanService);
  readonly router = inject(Router);

  readonly scheduleName = model('');
  readonly stops = signal<Stop[]>([]);
  readonly stopTimes = signal<Array<{ stop: Stop, time: WritableSignal<TimeString> }>>([]);
  readonly stopTypes = signal<'pick up' | 'drop off'>('pick up');
  readonly buses = signal<Bus[]>([]);
  readonly routes = model<Route[]>([]);
  readonly schedules = model<Schedule[]>([]);
  readonly editingSchedule = signal<Schedule | null>(null);
  daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  readonly daySettings = signal<Array<{ day: DayOfWeek, selected: boolean }>>([]);

  readonly sortedStopTimes = computed(() => {
    return [...this.stopTimes()].sort((a, b) => {
      const at = a.time();
      const bt = b.time();
      if (at && bt) {
        if (at < bt) return -1;
        if (at > bt) return 1;
      } else if (at && !bt) {
        return -1;
      } else if (!at && bt) {
        return 1;
      }
      // Fallback to stop id
      if (a.stop.id < b.stop.id) return -1;
      if (a.stop.id > b.stop.id) return 1;
      return 0;
    });
  });

  constructor() {
    effect(() => {
      const plan = this.planService.currentPlan();
      if (plan && Array.isArray(plan.routes)) {
        this.routes.set(plan.routes.map(r => ({ ...r })));
        this.schedules.set(plan.schedules?.map(s => ({ ...s })) ?? []);
      } else {
        this.routes.set([]);
        this.schedules.set([]);
      }
      this.stops.set(plan?.stops ?? []);
    });
  }

  setStopTime(stopId: string, value: string) {
    this.stopTimes.set({ ...this.stopTimes(), [stopId]: value });
  }

  addSchedule() {
    const emptySchedule: Schedule = {
      id: nanoid(),
      name: this.scheduleName(),
      days: [],
      stops: this.stops().map(stop => ({
        stopId: stop.id,
        time: this.stopTimes().find(st => st.stop.id === stop.id)?.time() ?? '',
        stopType: this.stopTypes()
      }))
    };
    this.schedules.update(arr => [...arr, emptySchedule]);
    // Optionally clear form fields for next schedule
    this.scheduleName.set('');
    this.daySettings.set(this.daysOfWeek.map(d => ({ day: d, selected: false })));
    this.stopTimes.set(this.stops().map(s => ({ stop: s, time: signal('') })));
    this.stopTypes.set('pick up');
    this.editingSchedule.set(emptySchedule);
  }

  editSchedule(schedule: Schedule) {
    this.editingSchedule.set(null);
    this.editingSchedule.set(schedule);
    this.scheduleName.set(schedule.name);
    this.daySettings.set(this.daysOfWeek.map(d => ({
      day: d,
      selected: schedule.days.includes(d)
    })));
    this.stopTimes.set(this.stops().map(s => {
      const stopEntry = schedule.stops.find(st => st.stopId === s.id);
      console.log({ s, stopEntry });
      return { stop: s, time: signal(stopEntry?.time ?? '') };
    }));
    if (schedule.stops.length > 0) {
      this.stopTypes.set(schedule.stops[0].stopType);
    } else {
      this.stopTypes.set('pick up');
    }
  }

  removeSchedule(name: string) {
    this.schedules.update(arr => arr.filter(s => s.name !== name));
  }

  save() {
    const plan = this.planService.currentPlan();
    if (!plan) {
      return;
    }

    const daysSelected = this.daySettings().filter(ds => ds.selected).map(ds => ds.day);
    const stopsSaved = this.stops().map(stop => ({
      stopId: stop.id,
      time: this.stopTimes().find(st => st.stop.id === stop.id)?.time() ?? '',
      stopType: this.stopTypes()
    }));
    console.log('[SAVE] daysSelected:', daysSelected);
    console.log('[SAVE] stopsSaved:', stopsSaved);
    console.log('[SAVE] scheduleName:', this.scheduleName());
    console.log('[SAVE] editingSchedule:', this.editingSchedule());

    const updatedPlan: TransportationPlan = {
      ...plan,
      schedules: this.schedules().map(s => {
        if (s.id === this.editingSchedule()?.id) {
          return {
            ...s,
            name: this.scheduleName(),
            days: daysSelected,
            stops: stopsSaved
          };
        }
        return s;
      }),
      updatedAt: new Date().toISOString()
    };
    console.log('[SAVE] updatedPlan:', updatedPlan);
    this.planService.updatePlan(updatedPlan);
    this.schedules.set(updatedPlan.schedules.map(s => ({ ...s })));
  }
}
