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
  readonly title = signal("Bus 3.14 - Elementary");
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
    // ...['B', 'E']
    //   .flatMap((l) => new Array(this.rows())
    //     .fill(null)
    //     .map((_, i) => `${i + 1}${l}`))
    //   .reduce((acc, seat) => ({ ...acc, [seat]: undefined }), {} as Record<string, string | null | undefined>),

    // assigned seats
    ...(`Amina K.
Hiroshi T.
Leila M.
Mateo R.
Zainab S.
Jalen B.
Priya D.
Fatima N.
Luca V.
Mei L.
Elijah G.
Saanvi P.
Omar H.
Yara C.
Diego F.
Anika W.
Kwame J.
Sofia Z.
Niko E.
Hana Y.
Tariq A.
Ingrid U.
Rajiv O.
Amara Q.
Jin X.
Carmen I.
Theo K.
Zahra T.
Malik M.
Linh R.
Ayden S.
Esmé B.
Kofi D.
Mireya N.
Arjun L.
Noemi G.
Bashir P.
Elodie H.
Takumi C.
Soraya F.
Idris W.
Chioma J.
Renzo Z.
Nia E.
Haruto Y.
Brisa A.
Efe U.
Liyana O.
Joaquin Q.
Aaliyah X.
Zubair I.
Malika K.
Kenji T.
Suri M.
Dario R.
Tenzin S.
Nyla B.
Mohan D.
Mireille N.
Jiro L.
Amira G.
Imani P.
Rami H.
Keiko C.
Elias F.
Zahid W.
Lior J.
Amaya Z.
Minh E.
Samira Y.
Avi A.
Noura U.
Satoshi O.


Idris I.
Kalani Q.
Zoya X.
`
// +`
// Aderinsola M.
// Emiliano V.
// Shiori T.
// Yusuf K.
// Mireya J.
// Tanaka S.
// Eamon D.
// Nalani H.
// `
)
  .split(/\n/g)
  .map(line => line.trim())
  .reduce((acc, curr, i) => {
    const col = i % (this.ridersPerBench() * 2);
    const row = Math.floor(i / (this.ridersPerBench() * 2));
    const letter = ['A', 'B', 'C', 'D', 'E', 'F'][col];
    const seatId = `${row + 1}${letter}`;
    acc[seatId] = curr;
    return acc;
  }, {} as Record<string, string>)
});

  constructor() {
    effect(() => console.log(this.seatAssignments()));
  }
}
