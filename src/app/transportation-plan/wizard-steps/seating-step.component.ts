import { Component, inject, model, effect, signal, computed } from '@angular/core';
import { TransportationPlanService } from '../transportation-plan.service';
import { FormsModule } from '@angular/forms';
import { SeatingDiagram } from '../../pages/seats/seating-diagram/seating-diagram';
import { Student, SeatAssignment } from '../../models';

@Component({
  selector: 'app-seating-step',
  standalone: true,
  imports: [FormsModule, SeatingDiagram],
  template: `
    <div class="print-seating-diagram">
      <h3 class="screen-only">Seating Assignments Step</h3>
      <form class="seating-form screen-only">
        <label>Riders per bench:
          <input [(ngModel)]="ridersPerBench" type="number" min="1" max="4" name="ridersPerBench" required />
        </label>
      </form>
      <div class="seating-columns">
        <div class="diagram-column">
          <app-seating-diagram
            [title]="planTitle()"
            [rows]="busRows()"
            [ridersPerBench]="ridersPerBench()"
            [shortRearBench]="shortRearBench()"
            [seatAssignments]="seatAssignmentsMap()"
            [students]="studentMap()"
            (seatClick)="onSeatClick($event)"
            [colorCoded]="colorCoded()"
          ></app-seating-diagram>
        </div>
        <div class="controls-column screen-only">
          <div>
            <button (click)="clearSeatAssignments()">Delete All Seat Assignments</button>
          </div>
          <div>
            <input [(ngModel)]="colorCoded" type="checkbox" name="colorCoded" id="colorCoded" />
            <label for="colorCoded">color-code seats</label>
          </div>
          @if (selectedStudent()) {
            <div>
              <h3>Selected Student: {{ selectedStudent()?.displayName }}</h3>
              <p>Click a seat to assign {{ selectedStudent()?.displayName }} to that seat, or click their name below to unselect them.</p>
            </div>
          }
          <div>
            <h3>Unassigned Students ({{unassignedStudents().length}})</h3>
            @for (student of unassignedStudents(); track student.id) {
              <div
                [title]="student.name + ' (' + student.grade + ')'"
                class="available-student"
                (click)="selectedStudent.set(student)"
              >{{ student.displayName }} ({{student.grade}})</div>
            } @empty {
              <div>No unassigned students</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
  ` @media print {
      @page {
        size: letter portrait;
      }
      app-seating-diagram {
        position: absolute;
        top: 0;
        left: 0;
      }
    }
    .seating-form {
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .seating-columns {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 2rem;
      align-items: flex-start;
      margin-top: 2rem;
    }
    .diagram-column {
      min-width: 0;
    }
    .controls-column {
      min-width: 250px;
      max-width: 350px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .edit-seat {
      margin-top: 1.5rem;
    }
    .available-student {
      cursor: pointer;
      padding: .25rem;
    }
  `]
})
export class SeatingStepComponent {
  readonly planService = inject(TransportationPlanService);
  readonly colorCoded = signal(false);
  readonly selectedStudent = signal<Student | undefined>(undefined);

  readonly ridersPerBench = model<number>(this.planService.currentPlan()?.ridersPerBench ?? 3);

  planTitle = computed(() => this.planService.currentPlan()?.name ?? 'Seating Chart');
  busRows = computed(() => this.planService.currentPlan()?.bus?.rows ?? 13);
  shortRearBench = computed(() => this.planService.currentPlan()?.bus?.shortRearBench ?? true);

  seatAssignmentsMap = computed(() => {
    const plan = this.planService.currentPlan();
    // Convert array of SeatAssignment to Record<seatId, studentId>
    if (!plan?.seatAssignments) return {};
    return plan.seatAssignments.reduce((acc, sa) => {
      acc[sa.seatId] = sa.studentId;
      return acc;
    }, {} as Record<string, string | null | undefined>);
  });

  studentMap = computed(() => {
    const plan = this.planService.currentPlan();
    if (!plan?.students) return {};
    return plan.students.reduce((acc, student) => {
      acc[student.id] = student;
      return acc;
    }, {} as Record<string, Student>);
  });

  assignedStudents = computed(() => {
    const students = this.studentMap();
    const seatAssignments = this.seatAssignmentsMap();
    const assignedStudentIds = Object.values(seatAssignments).filter(id => id !== null && id !== undefined);
    return Object.values(students).filter(student => assignedStudentIds.includes(student.id));
  });

  unassignedStudents = computed(() => {
    const students = this.studentMap();
    const assignedStudents = this.assignedStudents();
    return Object.values(students)
      .filter(student => !assignedStudents.find(s => s.id === student.id))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  });

  trackStudent(index: number, student: Student) {
    return student.id;
  }

  constructor() {
    effect(() => {
      const val = this.ridersPerBench();
      const plan = this.planService.currentPlan();
      if (plan && plan.ridersPerBench !== val) {
        this.planService.updatePlan({ ...plan, ridersPerBench: val });
      }
    });
  }

  clearSeatAssignments() {
    const plan = this.planService.currentPlan();
    if (plan) {
      this.planService.updatePlan({ ...plan, seatAssignments: [] });
    }
  }

  onSeatClick(seat: { seatId: string, rider: string | null | undefined } | undefined) {
    if (!seat) return;
    const plan = this.planService.currentPlan();
    if (!plan) return;

    const currentlySelectedStudent = this.selectedStudent();
    let pickedUpStudent: Student | undefined = undefined;
    // Remove student from seat if present
    if (seat.rider) {
      pickedUpStudent = this.studentMap()[seat.rider];
      this.updateSeat(seat.seatId, null);
    }
    // Assign selected student to seat
    if (currentlySelectedStudent) {
      this.updateSeat(seat.seatId, currentlySelectedStudent.id);
    }
    this.selectedStudent.set(pickedUpStudent);
  }

  updateSeat(seatId: string, rider: string | null | undefined) {
    const plan = this.planService.currentPlan();
    if (!plan) return;
    let seatAssignments = plan.seatAssignments ?? [];
    // Remove any assignment for this seat
    seatAssignments = seatAssignments.filter(sa => sa.seatId !== seatId);
    // Add new assignment if rider is present
    if (rider) {
      seatAssignments.push({ seatId, studentId: rider });
    }
    this.planService.updatePlan({ ...plan, seatAssignments });
  }
}
