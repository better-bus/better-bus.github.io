import { DatePipe } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';
import { BusSeat } from './bus-seat';

export type SeatAssignments = Record<string, string | null | undefined>;

@Component({
  selector: 'app-seating-diagram',
  imports: [DatePipe, BusSeat],
  templateUrl: './seating-diagram.html'
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
  readonly rowSpacingIn = signal(.0625);
  readonly headerFontSize = signal(25);
  readonly dpi = signal(96);
  readonly benchesPerRow = signal(2);
  readonly indexWidthIn = signal(1.125);
  readonly indexFontSize = signal(9.25);

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
  readonly indexWidthPx = computed(() => this.dpi() * this.indexWidthIn());

  readonly availableHeight = computed(() => this.heightPx() - this.marginPx() * 2/* top and bottom margin */ - this.headerHeight());
  readonly availableWidth = computed(() => this.widthPx() - this.marginPx() * 2/* left and right margin */ - this.indexWidthPx());
  readonly seatDiameter = computed(() =>
    Math.min(
      (this.availableHeight() / this.rows() - this.rowSpacingPx()),
      (this.availableWidth() / (this.ridersPerRow() + 3/* to account for labels and aisles */))
    )
  );
  readonly seatRadius = computed(() => this.seatDiameter() / 2);
  readonly seatLabelFontSize = computed(() => this.seatRadius() * 0.6/* ? */);
  readonly centerX = computed(() => (this.widthPx() - this.indexWidthPx()) / 2);
  readonly benchWidth = computed(() => this.ridersPerBench() * this.seatDiameter());

  readonly riderIndex = computed(() => {
    const seatAssignments = this.seatAssignments();
    return Object.keys(seatAssignments)
      .filter(key => !!seatAssignments[key])
      .map(key => [seatAssignments[key], key] as const)
      .sort(([nameA], [nameB]) => nameA!.localeCompare(nameB!));
  });
}
