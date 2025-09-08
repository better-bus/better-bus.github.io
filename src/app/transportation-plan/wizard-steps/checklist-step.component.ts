import { Component } from '@angular/core';
import { signal, effect, model, inject } from '@angular/core';
import { TransportationPlan, Stop, Student, Schedule, SeatAssignment } from '../../models';
import { TransportationPlanService } from '../transportation-plan.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checklist-step',
  imports: [FormsModule],
  template: `
    <h2>Checklist Report</h2>
    <label for="schedule">Select Schedule:</label>
    <select [(ngModel)]="selectedScheduleId">
      <div class="checklist-header">
        <h2 class="plan-title">{{ plan()?.name }}</h2>
        @if (selectedSchedule()) {
          <h3 class="schedule-title">Schedule: {{ selectedSchedule()?.name }}</h3>
        }
      </div>
      @for (schedule of schedules(); track schedule.id) {
        <option [value]="schedule.id">{{ schedule.name }}</option>
      }
    </select>
    @if (selectedSchedule()) {
      <div class="checklist-columns">
        @for (stopInfo of orderedStops(); track stopInfo.stopId) {
          @if (getStop(stopInfo.stopId)) {
            <div class="stop-block">
              <h3><strong>{{ getStop(stopInfo.stopId)?.id }}: {{ getStop(stopInfo.stopId)?.nickname }}</strong> <i>{{ getStop(stopInfo.stopId)?.address }}</i> <span class="time">({{ stopInfo.time }})</span></h3>
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
    .stop-block { margin-bottom: 1.2rem; break-inside: avoid; }
    .time { color: var(--primary-color, #007bff); }
    .checklist-columns {
      column-count: 2;
      column-gap: 2rem;
      width: 100%;
    }
    .checklist-header {
      margin-bottom: 0.5rem;
      text-align: center;
    }
    .plan-title {
      font-size: 1.2em;
      margin-bottom: 0.2em;
    }
    .schedule-title {
      font-size: 1em;
      margin-bottom: 0.2em;
    }
    .screen-only {
      display: block;
    }
    h3 {
      font-weight: normal;
      display: flex;
      flex-direction: row;
      gap: 0.5rem;

      >*:last-child {
        flex: 1;
        text-align: right;
      }
    }
  `
})
export class ChecklistStepComponent {
  readonly planService = inject(TransportationPlanService);
  readonly plan = this.planService.currentPlan;

  readonly schedules = signal<Schedule[]>([]);
  readonly selectedScheduleId = model<string>('');

  constructor() {
    effect(() => {
      this.schedules.set(this.plan()?.schedules ?? []);
      if (this.schedules().length && !this.selectedScheduleId()) {
        this.selectedScheduleId.set(this.schedules()[0].id);
      }
    });
  }

  selectedSchedule(): Schedule | undefined {
    return this.schedules().find((s: Schedule) => s.id === this.selectedScheduleId());
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

  orderedStops(): any[] {
    const schedule = this.selectedSchedule();
    if (!schedule?.stops) return [];
    // Sort by time (lexical), fallback to stopId
    return [...schedule.stops].sort((a: any, b: any) => {
      if (a.time && b.time) {
        if (a.time < b.time) return -1;
        if (a.time > b.time) return 1;
      }
      // Fallback to stopId
      if (a.stopId < b.stopId) return -1;
      if (a.stopId > b.stopId) return 1;
      return 0;
    });
  }
}
