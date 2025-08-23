import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeatingDiagram } from './seating-diagram/seating-diagram';

@Component({
  selector: 'app-root',
  imports: [SeatingDiagram],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('seating');
}
