import { Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { debounceTime, filter, map } from "rxjs";

@Injectable({ providedIn: 'root' })
export class RouteStateSignalService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly currentRoute = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    debounceTime(100),
    map(() => ({ snapshot:this.router.routerState.snapshot, activatedRoute: this.activatedRoute }))
  ));
}
