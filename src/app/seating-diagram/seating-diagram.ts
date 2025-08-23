import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-seating-diagram',
  imports: [],
  templateUrl: './seating-diagram.html',
  styleUrl: './seating-diagram.scss'
})
export class SeatingDiagram {
  readonly rows = input.required<number>();
  readonly ridersPerBench = input.required<number>();
  readonly shortRearBench = input<boolean>(false);
  readonly rowSeatNames = computed(() => {
    const ridersPerBench = this.ridersPerBench();
    const seatNames = [];
    for (let i = 0; i < ridersPerBench * 2; i++) {
      seatNames.push(String.fromCharCode(65 + i));
    }
    return seatNames;
  });
}
