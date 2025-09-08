import { Component } from '@angular/core';
import { signal, effect, model, inject } from '@angular/core';
import { Stop, Student, Schedule, SeatAssignment, DayOfWeek } from '../../models';
import { TransportationPlanService } from '../transportation-plan.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-checklist-step',
  imports: [FormsModule, DatePipe],
  template: `
<div class="checklist-header">
  <span class="plan-title print-only">{{ plan()?.name }}</span>
  <span class="bus-number print-only">Bus: {{ plan()?.bus?.number ?? '' }}</span>
  <span class="schedules print-only">
    @for (schedule of selectedSchedules(); track schedule.id) {
      <span class="schedule-title print-only">{{ schedule.name }}</span>
    }
  </span>
  <h2 class="plan-title screen-only">Checklist Report</h2>
  <label for="schedule-group" class="screen-only">Select Schedule Group:</label>
  <select id="schedule-group" [(ngModel)]="selectedGroupIdx" class="screen-only">
    @for (group of scheduleGroups(); track group.label) {
      <option [value]="scheduleGroups().indexOf(group)">{{ group.label }}</option>
    }
  </select>
</div>
    @if (selectedSchedules().length) {
      <div class="checklist-columns">
        @for (stopInfo of orderedStops(); track stopInfo.stopId) {
          @if (getStop(stopInfo.stopId)) {
            <div class="stop-block">
              <h3>
                <strong>{{ getStop(stopInfo.stopId)?.id }}: {{ getStop(stopInfo.stopId)?.nickname }}</strong>
                <i>{{ getStop(stopInfo.stopId)?.address }}</i>
                <span class="time">
                  @for (time of stopInfo.times; track time.getTime()) {
                    {{ time | date:'shortTime' }}
                    @if (stopInfo.times.indexOf(time) < stopInfo.times.length - 1) { / }
                  }
                </span>
              </h3>
              <ul>
                @for (student of studentsForStop(stopInfo.stopId); track student.id) {
                  <li>
                    @if (hasSeatingAssignment(student.id)) {
                      <span class="bold">{{ student.displayName }}</span>
                    } @else {
                      <span class="italic">{{ student.displayName }}</span>
                    }
                  </li>
                }
              </ul>
            </div>
          }
        }
      </div>
    }
  `,
  styles: `
    .bold { font-weight: bold; }
    .italic { font-style: italic; }
    .stop-block { margin-bottom: 1.2rem;  }
    .time { color: var(--primary-color, #007bff); }
    .checklist-columns {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      width: 100%;
    }
    .stop-block {
      flex: 1 1 350px;
      min-width: 300px;
      max-width: 100%;
      box-sizing: border-box;
      margin-bottom: 1.2rem;

      h3 {
        margin-bottom: 0 !important;
      }
    }
    @media print {
      @page {
        margin: 0.5cm;
      }
      .checklist-columns {
        display: block;
        column-count: 2;
        column-gap: 1.5rem;
        width: 100%;
        max-width: 100%;
      }
      .stop-block {
        display: block;
        min-width: 0;
        max-width: 100%;
        margin-bottom: 1rem;
      }
      .stop-block, .checklist-columns {
        font-size: 14.5px !important;
        line-height: 1.15 !important;
        margin-inline: 0 !important;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
        padding: 0 !important;
      }
      .stop-block {
        margin-bottom: 0.5rem !important;
      }
    }
    .checklist-header {
      margin-bottom: 0.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .screen-only {
      display: block;
    }
    h3 {
      font-weight: normal;
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
      border-bottom: 1px solid #ccc;
      margin-bottom: 0 !important;

      >*:last-child {
        flex: 1;
        text-align: right;
      }
    }
    .print-only { display: none; }
    @media print {
      .print-only { display: block !important; }
      .screen-only { display: none !important; }
      .checklist-header {
        font-size: 24px !important;
        font-weight: bold;
        margin-bottom: 0.5rem;
        flex-direction: row;
        justify-content: space-between;
        gap: 1rem;
      }
    }
    .schedules {
      display: flex !important;
      flex-direction: row !important;
      gap: 0.5rem !important;
    }

    ul {
      padding-block: 0 !important;
      margin-block: 0.25rem !important;
    }
  `
})
export class ChecklistStepComponent {
  readonly planService = inject(TransportationPlanService);
  readonly plan = this.planService.currentPlan;

  readonly schedules = signal<Schedule[]>([]);
  readonly selectedScheduleIds = model<string[]>([]); // Support multiple schedules
  readonly scheduleGroups = signal<{ label: string, ids: string[] }[]>([]);
  readonly selectedGroupIdx = model<number>(0);

  constructor() {
    effect(() => {
      this.schedules.set(this.plan()?.schedules ?? []);
      // Build schedule groups
      const groups: { label: string, ids: string[] }[] = [];
      const all = this.schedules();
      if (all.length) {
        // Group by type
        const byType: Record<string, Schedule[]> = {};
        all.forEach(sch => {
          byType[sch.stops[0].stopType] = byType[sch.stops[0].stopType] || [];
          byType[sch.stops[0].stopType].push(sch);
        });
        for (const type in byType) {
          const group = byType[type];
          // Find compatible sets
          const used: Set<string> = new Set();
          for (let i = 0; i < group.length; i++) {
            if (used.has(group[i].id)) continue;
            let compatibleIds = [group[i].id];
            for (let j = 0; j < group.length; j++) {
              if (i === j || used.has(group[j].id)) continue;
              // Check day overlap
              if (group[i].days.some((d: DayOfWeek) => group[j].days.includes(d))) continue;
              // Check stop order
              const stopsA = group[i].stops.map((s: any) => s.stopId).join(',');
              const stopsB = group[j].stops.map((s: any) => s.stopId).join(',');
              if (stopsA !== stopsB) continue;
              compatibleIds.push(group[j].id);
              used.add(group[j].id);
            }
            used.add(group[i].id);
            // Label: type + names
            const label = compatibleIds.map(id => {
              const sch = all.find(s => s.id === id);
              return sch ? sch.name : id;
            }).join(' & ');
            groups.push({ label: `${type}: ${label}`, ids: compatibleIds });
          }
        }
      }
      this.scheduleGroups.set(groups);
      // Default selection
      if (groups.length) {
        this.selectedGroupIdx.set(0);
        this.selectedScheduleIds.set(groups[0].ids);
      }
    });
    effect(() => {
      const idx = this.selectedGroupIdx();
      const groups = this.scheduleGroups();
      if (groups[idx]) {
        this.selectedScheduleIds.set(groups[idx].ids);
      }
    });
  }

  selectedSchedules(): Schedule[] {
    return this.schedules().filter((s: Schedule) => this.selectedScheduleIds().includes(s.id));
  }

  getStop(stopId: string): Stop | undefined {
    return this.plan()?.stops?.find((s: Stop) => s.id === stopId);
  }

  studentsForStop(stopId: string): Student[] {
    const plan = this.plan();
    if (!plan?.roster?.stopAssignments) return [];
    const studentIds = plan.roster.stopAssignments
      .filter((sa: any) => sa.stop.id === stopId)
      .map((sa: any) => sa.student.id);
    return plan.students.filter((s: Student) => studentIds.includes(s.id));
  }

  hasSeatingAssignment(studentId: string): boolean {
    const plan = this.plan();
    return !!plan?.seatAssignments?.find((sa: SeatAssignment) => sa.studentId === studentId);
  }

  // Returns stops with all scheduled times, sorted by frequency (most days to least), joined by '/'
  orderedStops(): any[] {
    const schedules = this.selectedSchedules();
    if (!schedules.length) return [];
    // Assume all schedules have same stop order
    const stopOrder = schedules[0].stops.map((s: any) => s.stopId);
    // For each stop, collect all times and their frequencies
    const stopTimes: Record<string, Record<string, number>> = {};
    schedules.forEach(sch => {
      sch.stops.forEach((stop: any) => {
        stopTimes[stop.stopId] = stopTimes[stop.stopId] || {};
        sch.days.forEach(() => {
          stopTimes[stop.stopId][stop.time] = (stopTimes[stop.stopId][stop.time] || 0) + 1;
        });
      });
    });
    // For each stop, list all times sorted by frequency and join by '/'
    return stopOrder.map(stopId => {
      const timesObj = stopTimes[stopId] || {};
      const times = Object.keys(timesObj)
        .map(time => ({ time, count: timesObj[time] }))
        .sort((a, b) => b.count - a.count)
        .map(t => new Date(`1970-01-01T${t.time}:00`));
      return { stopId, times };
    });
  }

  // Returns schedules that can be combined on the checklist
  getCombinedSchedules(): Schedule[] {
    const all = this.schedules();
    if (!all.length) return [];
    // Group by type
    const byType: Record<string, Schedule[]> = {};
    all.forEach(sch => {
      byType[sch.stops[0].stopType] = byType[sch.stops[0].stopType] || [];
      byType[sch.stops[0].stopType].push(sch);
    });
    // For each type, find sets that:
    // - Don't overlap on days
    // - Have stops in same order
    for (const type in byType) {
      const group = byType[type];
      // Compare all pairs
      const result: Schedule[] = [];
      for (let i = 0; i < group.length; i++) {
        let compatible = true;
        for (let j = 0; j < group.length; j++) {
          if (i === j) continue;
          // Check day overlap
          if (group[i].days.some((d: DayOfWeek) => group[j].days.includes(d))) {
            compatible = false;
            break;
          }
          // Check stop order
          const stopsA = group[i].stops.map((s: any) => s.stopId).join(',');
          const stopsB = group[j].stops.map((s: any) => s.stopId).join(',');
          if (stopsA !== stopsB) {
            compatible = false;
            break;
          }
        }
        if (compatible) result.push(group[i]);
      }
      if (result.length > 1) return result;
    }
    // Fallback: just first schedule
    return [all[0]];
  }
}
