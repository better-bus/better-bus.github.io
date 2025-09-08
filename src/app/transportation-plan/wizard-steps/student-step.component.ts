import { Component, inject, signal, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TransportationPlanService } from '../transportation-plan.service';
import { Student, TransportationPlan } from '../../models';
import { ImportSheet } from '../../import-sheet/import-sheet';

@Component({
  selector: 'app-student-step',
  imports: [ImportSheet, RouterLink],
  template: `
    <h2>Add Students</h2>
    <app-import-sheet
      (studentsChange)="onStudentsImported($event)"
    ></app-import-sheet>

    <div class="student-list">
      <h3>Imported Students</h3>
      <ul>
        @for (student of students(); track student.id) {
          <li>
            {{ student.displayName }}
            @if (getStopId(student.id)) {
              <span style="color: var(--bb-gray); font-size: 0.95em;">(Stop: {{ getStopId(student.id) }})</span>
            }
          </li>
        }
      </ul>

    </div>

    <button class="wizard-nav" [routerLink]="['../seating']" [disabled]="students().length === 0">Next</button>
  `,
  styles: [`
    .student-list { margin-top: 1rem; }
    .wizard-nav { margin-top: 2rem; display: flex; gap: 1rem; }
  `]
})
export class StudentStepComponent {
  readonly transportationPlanService = inject(TransportationPlanService);
  readonly router = inject(Router);

  // Signal for students in the current plan
  readonly students = signal<Student[]>([]);

  // Load students from the plan on init
  constructor() {
    effect(() => {
      const plan = this.transportationPlanService.currentPlan() as TransportationPlan | undefined;
      const students = (plan?.students ?? []).sort((a,b) => a.displayName.localeCompare(b.displayName));
      this.students.set(students);
    });
  }

  // Handler for spreadsheet import
  onStudentsImported(imported: { student: Student, stopId: string }[]) {
    const plan = this.transportationPlanService.currentPlan() as TransportationPlan | undefined;
    if (plan) {
      // Extract students and stop assignments
      const students = imported.map(entry => entry.student);
      const stopAssignments = imported
        .filter(entry => entry.stopId)
        .map(entry => ({ stop: { id: entry.stopId } as any, student: entry.student }));

      // Update plan: students and roster.stopAssignments
      const updatedPlan: TransportationPlan = {
        ...plan,
        students,
        roster: {
          ...plan.roster,
          stopAssignments
        }
      };
      this.transportationPlanService.updatePlan(updatedPlan);
      students.sort((a,b) => a.displayName.localeCompare(b.displayName));
      this.students.set(students);
    }
  }

  // Helper to get stopId for a student
  getStopId(studentId: string): string | undefined {
    const plan = this.transportationPlanService.currentPlan() as TransportationPlan | undefined;
    const stopAssignment = plan?.roster?.stopAssignments?.find(sa => sa.student.id === studentId);
    return stopAssignment?.stop?.id;
  }
}
