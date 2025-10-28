import { Component, ElementRef, inject, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PageTitleService } from './routing/page-title.service';
import {Overlay, OverlayRef, } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ImportExportDataService } from './import-export-data/import-export-data.service';
import { BusService } from './transportation-plan/bus.service';

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
      <button #menuTarget class="subtle" (click)="toggleImportExportMenu(menu, menuTarget)">
        <span class="fas fa-ellipsis-vertical"></span>
      </button>
    </nav>
    <section>
      <router-outlet></router-outlet>
    </section>

    <ng-template #menu>
      <div class="menu">
        <button (click)="load(input)">
          <span class="fas fa-folder"></span>
          <span>Load...</span>
        </button>
        <input class="hidden" #input type="file" />
        <button (click)="save(output)">
          <span class="fas fa-save"></span>
          <span>Save...</span>
        </button>
        <a class="hidden" #output></a>
      </div>
    </ng-template>
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
    button.subtle {
      background-color: transparent;
      color: black;
    }
    button.subtle:hover {
      background-color: #aaa;
      opacity: .5;
    }
    .menu button {
      display: flex;
      gap: .5rem;
    }
    .menu {
      display: flex;
      flex-direction: column;
      gap: .125rem;
    }
    .hidden {
      display: none;
    }
  `
})
export class App {
  readonly titleService = inject(PageTitleService);
  readonly overlay = inject(Overlay);
  readonly vcr = inject(ViewContainerRef);
  readonly menuRef = signal<OverlayRef | undefined>(undefined);
  readonly importExportDataService = inject(ImportExportDataService);
  readonly busService = inject(BusService);
  readonly window = inject(Window);

  toggleImportExportMenu(menu: TemplateRef<any>, target: HTMLElement) {
    if (this.menuRef()) {
      this.closeMenu();
    } else {
      const strategy = this.overlay.position().flexibleConnectedTo(target).withPositions([{
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top'
      }]);
      const ref = this.overlay.create({positionStrategy: strategy, hasBackdrop: true});
      ref.backdropClick().subscribe(() => this.closeMenu());
      ref.attach(new TemplatePortal(menu, this.vcr));
      this.menuRef.set(ref);
    }
  }

  closeMenu(){
    this.menuRef()?.dispose();
    this.menuRef.set(undefined);
  }

  async load(input: HTMLInputElement) {
    const file = await new Promise<File>((resolve, reject) => {
      input.addEventListener('input', e => input.files?.length ? resolve(input.files[0]) : reject());
      input.click();
    })
    this.closeMenu();
    await this.importExportDataService.import(file);
    this.window.location.reload();
  }

  async save(output: HTMLAnchorElement) {
    const bus = this.busService.buses()[0];
    const baseName = bus ? `bus-${bus.number}` : 'better-bus';
    const extension = '.buspak';
    const file = await this.importExportDataService.export(baseName + extension);
    const url = URL.createObjectURL(file);
    output.href = url;
    output.download = file.name;
    output.click();
    this.closeMenu();
  }
}
