import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="no-print">
      <a [routerLink]="['/']" class="app-name">
        <img class="icon" src="icon.png" />
        <span>BetterBus</span>
      </a>
      <a [routerLink]="['/rosters']" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Rosters</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: `
    nav {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1rem;
    }
    nav a {
      display: flex;
      padding: 0.5rem;
    }
    .active {
      font-weight: bold;
    }
    .icon {
      width: 2rem;
      height: 2rem;
    }
    a.app-name {
      color: black;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      text-decoration: none;
      font-weight: bold;
      font-size: 1.5rem;
    }
    a.app-name:visited {
      color: black;
    }
    .hide {
      visibility: hidden;
    }
    .hide.show {
      visibility: visible;
    }
  `
})
export class App {
}
