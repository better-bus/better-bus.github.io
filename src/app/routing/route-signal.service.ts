import { Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router, NavigationEnd } from "@angular/router";
import { filter, map } from "rxjs";

@Injectable({ providedIn: 'root' })
export class RouteStateSignalService {
  private readonly router = inject(Router);

  readonly currentRoute = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.router.routerState.snapshot)
  ));
}
