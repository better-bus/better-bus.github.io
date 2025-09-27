import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PageTitleService } from './routing/page-title.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="screen-only app-navbar">
      <a [routerLink]="['/']" class="app-name">
        <img class="icon" src="icon.png" />
        <span>BetterBus</span>
      </a>
      <span class="page-title">{{ titleService.title() }}</span>
    </nav>
    <section>
      <router-outlet></router-outlet>
    </section>
  `,
  styles: `
    .app-navbar {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: #e5e7eb;
      padding: 0.5rem 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .app-name {
      color: black;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-weight: bold;
      font-size: 1.5rem;
      border-radius: 8px;
    }
    .app-name:visited {
      color: black;
    }
    .icon {
      width: 2rem;
      height: 2rem;
    }
    .page-title {
      flex: 1;
      text-align: center;
      font-size: 1.4rem;
      font-weight: 600;
      color: #222;
      letter-spacing: 0.02em;
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
  readonly titleService = inject(PageTitleService);
}
