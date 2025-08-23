import { DatePipe } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';
import { BusSeat } from './bus-seat';

export type SeatAssignments = Record<string, string | null | undefined>;

@Component({
  selector: 'app-seating-diagram',
  imports: [DatePipe, BusSeat],
  templateUrl: './seating-diagram.html',
  styleUrl: './seating-diagram.scss'
})
export class SeatingDiagram {
  readonly title = input.required<string>();
  readonly rows = input.required<number>();
  readonly ridersPerBench = input.required<number>();
  readonly shortRearBench = input<boolean>(false);
  readonly seatAssignments = input<SeatAssignments>({});

  readonly now = signal(new Date());
  readonly diagramSizeIn = signal({ width: 8.5, height: 11 });
  readonly marginSizeIn = signal(.5);
  readonly rowSpacingIn = signal(.125);
  readonly headerFontSize = signal(25);
  readonly dpi = signal(96);
  readonly benchesPerRow = signal(2);

  readonly ridersPerRow = computed(() => this.ridersPerBench() * this.benchesPerRow());
  readonly rowSeatNames = computed(() => {
    const ridersPerRow = this.ridersPerRow();
    const seatNames = [];
    for (let i = 0; i < ridersPerRow; i++) {
      seatNames.push(String.fromCharCode(65 + i));
    }
    return seatNames;
  });

  readonly headerHeight = computed(() => this.headerFontSize() * 1.5/* ? */);
  readonly widthPx = computed(() => this.dpi() * this.diagramSizeIn().width * .99); // prevents overflow onto a second, blank page
  readonly heightPx = computed(() => this.dpi() * this.diagramSizeIn().height * .99); // prevents overflow onto a second, blank page
  readonly marginPx = computed(() => this.dpi() * this.marginSizeIn());
  readonly rowSpacingPx = computed(() => this.dpi() * this.rowSpacingIn());

  readonly availableHeight = computed(() => this.heightPx() - this.marginPx() * 2/* top and bottom margin */ - this.headerHeight());
  readonly seatDiameter = computed(() => (this.availableHeight() / this.rows() - this.rowSpacingPx()));
  readonly seatRadius = computed(() => this.seatDiameter() / 2);
  readonly seatLabelFontSize = computed(() => this.seatRadius() * 0.6/* ? */);
  readonly centerX = computed(() => this.widthPx() / 2);
  readonly benchWidth = computed(() => this.ridersPerBench() * this.seatDiameter());


  constructor() {
    effect(() => console.log(this.benchWidth()));
  }
}
