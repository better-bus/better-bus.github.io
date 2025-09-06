import { computed, effect, inject, Injectable, Injector, runInInjectionContext } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouteStateSignalService } from "./route-signal.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

export const APP_NAME = 'BetterBus';

@Injectable({providedIn: 'root'})
export class PageTitleService {
  readonly titleService = inject(Title);
  readonly routeSignalService = inject(RouteStateSignalService);
  readonly injector = inject(Injector);

  readonly title = computed(() => {
    const route = this.routeSignalService.currentRoute();
    return route
      ? runInInjectionContext(this.injector, () => this.getTitle(route.snapshot))
      : '';
  });

  constructor() {
    effect(() => {
      const title = this.title();
      this.titleService.setTitle(title ? `${title} | ${APP_NAME}` : APP_NAME);
    });
  }

  private getTitle(route: RouterStateSnapshot): string {
    let node: ActivatedRouteSnapshot | null = route?.root ?? null;
    const titles: string[] = [];
    while (node) {
      const title = node.routeConfig?.data?.['title'] ?? node.routeConfig?.title;
      if (title) {
        if (typeof title === 'string') {
          titles.push(title);
        } else if (typeof title === 'function') {
          const resolved = (title as (route: typeof node) => string | (() => string))(node);
          if (typeof resolved === 'string') {
            titles.push(resolved);
          } else if (typeof resolved === 'function') {
            titles.push(resolved());
          }
        } else if (typeof title === 'object' && 'resolve' in title) {
          try {
            const resolver = inject(title as any) as { resolve: (route: typeof node) => string | Promise<string> };
            const resolved = resolver.resolve(node);
            if (typeof resolved === 'string') {
              titles.push(resolved);
            } // else ignore Promise for now
          } catch {}
        }
      }
      node = node.firstChild;
    }
    return titles.join(' > ');
  }
}
