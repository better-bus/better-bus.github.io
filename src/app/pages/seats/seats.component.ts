import { Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild } from "@angular/core";
import { SeatingDiagram } from "./seating-diagram/seating-diagram";
import { FormsModule } from "@angular/forms";
import { PERSISTENCE } from "../../persistence/persistence.provider";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { RostersService } from "../rosters/rosters.service";
import { Student } from "../../models";

export type SeatAssignments = Record<string, string | null | undefined>;
export type SeatAssignment = { seatId: string, rider: string | null | undefined } | undefined;

const PERSISTENCE_KEY = (routeId: string) => `seatAssignments.${routeId}`;

@Component({
  imports: [SeatingDiagram, FormsModule],
  template: `
    <app-seating-diagram
      [title]="title()"
      [rows]="rows()"
      [ridersPerBench]="ridersPerBench()"
      [shortRearBench]="shortRearBench()"
      [seatAssignments]="seatAssignments()"
      [students]="studentMap()"
      (seatClick)="onSeatClick($event)"
      [colorCoded]="colorCoded()"
    ></app-seating-diagram>

    <div class="left no-print">
      <div>
        <button (click)="seatAssignments.set({})">Delete All Seat Assignments</button>
      </div>

      <div>
        <input [(ngModel)]="colorCoded" type="checkbox" name="colorCoded" id="colorCoded" />
        <label for="colorCoded">color-code seats</label>
      </div>

      @if (selectedStudent(); as student) {
        <div>
          <h3>Selected Student: {{ student.displayName }}</h3>
          <p>Click a seat to assign {{ student.displayName }} to that seat, or click their name below to unselect them.</p>
        </div>
      }

      <div>
        <h3>Unassigned Students ({{unassignedStudents().length}})</h3>
        @for (student of unassignedStudents(); track student.id)
        {
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
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: row;
      gap: 1.5rem;
    }
    .edit-seat {
      margin-top: 1.5rem;
    }
    .available-student {
      cursor: pointer;
      padding: .25rem;
    }
    .left {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  `
})
export class SeatsComponent implements OnInit {
  readonly persistence = inject(PERSISTENCE);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly rosterService = inject(RostersService);

  readonly id$ = this.activatedRoute.params.pipe(map(params => params['id'] as string));
  readonly id = toSignal(this.id$, { initialValue: undefined });
  readonly selectedRoster = computed(() => {
    const id = this.id();
    const rosters = this.rosterService.rosters();

    return id && rosters ? rosters.find(r => r.id === id) : undefined;
  });

  readonly title = computed(() => {
    const selectedRoster = this.selectedRoster();
    return selectedRoster ? selectedRoster.name : 'Seating Chart';
  });
  readonly rows = signal(13);
  readonly ridersPerBench = signal(3);
  readonly shortRearBench = signal(true);
  readonly colorCoded = signal(false);

  readonly seatAssignments = signal<SeatAssignments>({});
  private loaded = false;

  readonly selectedStudent = signal<Student | undefined>(undefined);
  readonly riderInput = viewChild<ElementRef<HTMLInputElement>>('riderInput');
  readonly studentMap = signal<Record<string, Student>>({});
  readonly assignedStudents = computed(() => {
    const students = this.studentMap();
    const seatAssignments = this.seatAssignments();
    const assignedStudentIds = Object.values(seatAssignments).filter(id => id !== null && id !== undefined);
    return Object.values(students).filter(student => assignedStudentIds.includes(student.id));
  })
  readonly unassignedStudents = computed(() => {
    const students = this.studentMap();
    const assignedStudents = this.assignedStudents();
    return Object.values(students)
      .filter(student => !assignedStudents.find(s => s.id === student.id))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  });

  constructor() {
    effect(async () => {
      const selectedRoster = this.selectedRoster();
      if (selectedRoster) {
        this.loaded = false;
        const students = await Promise.all(selectedRoster.studentIds.map(id => this.rosterService.getStudent(id)));
        const existingSeats = await this.persistence.getData<SeatAssignments>(PERSISTENCE_KEY(selectedRoster.id));
        this.seatAssignments.set(existingSeats ?? {});
        this.studentMap.set(students.reduce((acc, student) => {
          if (student) {
            acc[student.id] = student;
          }
          return acc;
        }, {} as Record<string, Student>));
        await new Promise<void>((resolve) => setTimeout(resolve));
        this.loaded = true;
      }
    });

    effect(() => {
      const seatAssignments = this.seatAssignments();
      const selectedRoster = this.selectedRoster();
      if (selectedRoster && this.loaded) {
        this.persistence.saveData(PERSISTENCE_KEY(selectedRoster.id), seatAssignments);
      }
    });
  }

  ngOnInit(): void {
    this.load();
  }

  async load() {
    this.loaded = false;
    const selectedRoster = this.selectedRoster();
    if (selectedRoster) {
      const seatAssignments = await this.persistence.getData<SeatAssignments>(PERSISTENCE_KEY(selectedRoster.id));
      this.seatAssignments.set(seatAssignments);
      await new Promise<void>((resolve) => setTimeout(resolve));
    }
    this.loaded = true;
  }

  async onSeatClick(seat: { seatId: string, rider: string | null | undefined } | undefined) {
    if (!seat) {
      return;
    }

    const currentlySelectedStudent = this.selectedStudent();
    let pickedUpStudent: Student | undefined = undefined;
    if (seat.rider) {
      pickedUpStudent = this.studentMap()[seat.rider];
      this.updateSeat(seat.seatId, null);
    }
    if (currentlySelectedStudent) {
      this.updateSeat(seat.seatId, currentlySelectedStudent.id);
    }
    this.selectedStudent.set(pickedUpStudent);
  }

  updateSeat(seatId: string, rider: string | null | undefined) {
    this.seatAssignments.update(prev => ({
      ...prev,
      [seatId]: rider
    }));
  }
}
