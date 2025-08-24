import { Component, effect, ElementRef, inject, OnInit, signal, viewChild } from "@angular/core";
import { fakeSeatAssignments } from "./fake-seat-assignments";
import { SeatingDiagram } from "./seating-diagram/seating-diagram";
import { FormsModule } from "@angular/forms";
import { PERSISTENCE } from "../../persistence/persistence.provider";

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
      (seatClick)="onSeatClick($event)"
    ></app-seating-diagram>

    @if (selectedSeat(); as seat) {
      <div class="edit-seat">
        Selected Seat: {{ seat.seatId }} - {{ seat.rider }}<br/>
        Change assignment: <input #riderInput [(ngModel)]="seat.rider" (keyup.ENTER)="updateSeat(seat.seatId, seat.rider)" />
        <button (click)="updateSeat(seat.seatId, seat.rider)">Save</button>
        or <button (click)="updateSeat(seat.seatId, null)">Unassigned</button>
        or <button (click)="updateSeat(seat.seatId, undefined)">Unavailable</button>
      </div>
    }
    <button (click)="seatAssignments.set({})">Clear All</button>
  `,
  styles: `
    .edit-seat {
      margin-top: 1.5rem;
    }
  `
})
export class SeatsComponent implements OnInit {
  readonly title = signal("Bus 17 - Secondary");
  readonly rows = signal(13);
  readonly ridersPerBench = signal(3);
  readonly shortRearBench = signal(true);
  readonly seatAssignments = signal<SeatAssignments>(fakeSeatAssignments(this.rows(), this.ridersPerBench()));
  private loaded = false;
  readonly persistence = inject(PERSISTENCE);

  readonly selectedSeat = signal<SeatAssignment>(undefined);
  readonly riderInput = viewChild<ElementRef<HTMLInputElement>>('riderInput');

  constructor(){
    effect(() => {
      const seatAssignments = this.seatAssignments();
      if (this.loaded) {
        this.persistence.saveData(PERSISTENCE_KEY(this.title()), seatAssignments);
      }
    })
  }

  ngOnInit(): void {
    this.load();
  }

  async load() {
    this.loaded = false;
    const seatAssignments = await this.persistence.getData<SeatAssignments>(PERSISTENCE_KEY(this.title()));
    this.seatAssignments.set(seatAssignments);
    this.loaded = true;
  }

  async onSeatClick(seat: { seatId: string, rider: string | null | undefined } | undefined) {
    this.selectedSeat.set(seat);
    await new Promise(resolve => setTimeout(resolve, 100));
    this.riderInput()?.nativeElement.focus();
    this.riderInput()?.nativeElement.select();
  }

  updateSeat(seatId: string, rider: string | null | undefined) {
    this.seatAssignments.update(prev => ({
      ...prev,
      [seatId]: rider
    }));
  }
}
