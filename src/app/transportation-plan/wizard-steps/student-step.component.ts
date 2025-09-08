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
          <li>{{ student.displayName }}</li>
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
  onStudentsImported(imported: Student[]) {
    const plan = this.transportationPlanService.currentPlan() as TransportationPlan | undefined;
    if (plan) {
      const updatedPlan: TransportationPlan = { ...plan, students: imported };
      this.transportationPlanService.updatePlan(updatedPlan);
      imported.sort((a,b) => a.displayName.localeCompare(b.displayName));
      this.students.set(imported);
    }
  }
}
