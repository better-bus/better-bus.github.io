import { Component, computed } from '@angular/core';
import { signal, effect, inject } from '@angular/core';
import { Schedule, Stop, Student } from '../../../models';
import { TransportationPlanService } from '../../transportation-plan.service';
import { FormsModule } from '@angular/forms';
import { formatDate } from '@angular/common';

interface ScheduleGroup {
  type: 'pick up' | 'drop off';
  label: string;
  schedules: Schedule[];
  stops: Array<Stop & {
    times: Date[];
    timesFormatted: string;
    students: Array<Student & { hasSeat: boolean }>;
  }>;
}

@Component({
  selector: 'app-checklist-step',
  imports: [FormsModule],
  templateUrl: `./checklist-step.component.html`,
  styleUrls: [`./checklist-step.component.scss`]
})
export class ChecklistStepComponent {
  readonly WEEKDAYS = ['M', 'Tu', 'W', 'Th', 'F'];
  readonly planService = inject(TransportationPlanService);
  readonly plan = this.planService.currentPlan;

  readonly schedules = signal<Schedule[]>([]);
  readonly scheduleGroups = computed<ScheduleGroup[]>(() => {
    const plan = this.plan();
    if (!plan) return [];

    const schedules = this.schedules();
    const groups = schedules.reduce((prev, curr) => {
      console.log({prev, curr});
      const stopType = curr.stops[0].stopType;
      const group = prev.find(g => g.type === stopType);
      if (group) {
        group.schedules!.push(curr);
      } else {
        prev.push({ type: stopType, schedules: [curr] });
      }
      return prev;
    }, [] as Array<Partial<ScheduleGroup>>);
    return groups.map(g => ({
      ...g,
      schedules: g.schedules!.sort((a, b) => (b.days.length - a.days.length) || a.name.localeCompare(b.name))
    })).map(g => ({
      ...g,
      label: `${g.type} (${g.schedules.map(s => s.name).join(', ')})`,
      stops: g.schedules[0].stops.map(s => {
        const stop = plan.stops.find(stop => stop.id === s.stopId)!;
        if (!stop) return null;

        return ({
          ...stop,
          times: g.schedules.map(sch => {
            const time = sch.stops.find(s => s.stopId === stop.id)!.time;
            return new Date(`Jan 1 1970 ${time}`);
          }),
          students: plan.roster.stopAssignments.filter(s => s.stop.id === stop.id).map(s => ({
            ...s.student,
            hasSeat: !!plan.seatAssignments.find(a => a.studentId === s.student.id)
          })).sort((a,b) => (a.hasSeat && !b.hasSeat ? -1 : b.hasSeat && !a.hasSeat ? 1 : (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name)))
        })
      }).filter(s => !!s)
      .sort((a,b) => a.times[0].getTime() - b.times[0].getTime())
      .map(s => ({
        ...s,
        timesFormatted: s.times.map(t => formatDate(t, 'shortTime', 'en-US')).map(t => `<span class="nowrap">${t}</span>`).join(' <wbr>/<wbr> ')
      }))
    } as ScheduleGroup))
  });
  readonly selectedGroupIdx = signal<number | null>(null);
  readonly selectedGroup = computed(() => this.scheduleGroups()?.[this.selectedGroupIdx() ?? NaN]);

  constructor() {
    effect(() => {
      this.schedules.set(this.plan()?.schedules ?? []);
    });
    effect(() => {
      const groups = this.scheduleGroups();
      if (!this.selectedGroup() && groups.length) {
        this.selectedGroupIdx.set(0);
      }
    });
    effect(() => {
      const selectedGroup = this.selectedGroup();
      console.log({selectedGroup})
    });
  }
}
