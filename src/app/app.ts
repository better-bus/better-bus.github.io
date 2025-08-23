import { Component, effect, signal } from '@angular/core';
import { SeatingDiagram } from './seating-diagram/seating-diagram';

@Component({
  selector: 'app-root',
  imports: [SeatingDiagram],
  template: `
    <app-seating-diagram
      [title]="title()"
      [rows]="rows()"
      [ridersPerBench]="ridersPerBench()"
      [shortRearBench]="shortRearBench()"
      [seatAssignments]="seatAssignments()"
    ></app-seating-diagram>
  `
})
export class App {
  readonly title = signal("Bus 17 - Secondary");
  readonly rows = signal(13);
  readonly ridersPerBench = signal(3);
  readonly shortRearBench = signal(true);
  readonly seatAssignments = signal({
    // by default a seat exists but is not assigned (null)
    ...['A', 'B', 'C', 'D', 'E', 'F']
      .flatMap((l) => new Array(this.rows())
        .fill(null)
        .map((_, i) => `${i + 1}${l}`))
      .reduce((acc, seat) => ({ ...acc, [seat]: null }), {} as Record<string, string | null | undefined>),

    // for Secondary students I only want 2 per bench (but don't want to set that setting
    // because it will confuse everyone since elementary uses 3 per bench in the same bus)
    // so the seat is unavailable (undefined)
    ...['B', 'E']
      .flatMap((l) => new Array(this.rows())
        .fill(null)
        .map((_, i) => `${i + 1}${l}`))
      .reduce((acc, seat) => ({ ...acc, [seat]: undefined }), {} as Record<string, string | null | undefined>),

    '1A': 'Alice G.',
    '1C': 'Charlie I.',
    '1D': 'David J.',
    '1F': 'Frank L.',
    '2A': 'Joan M.',
    '2C': 'Jill O.',
    '2D': 'James P.',
    '2F': 'John R.',
    '3A': 'Remmington L.'
  });

  constructor() {
    effect(() => console.log(this.seatAssignments()));
  }
}
