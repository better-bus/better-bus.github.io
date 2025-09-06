# Copilot Instructions for better-bus/seating

## Project Architecture
- This is a modern Angular app (Angular 20+) using standalone components, signals, and new control flow syntax (`@for`, `@if`).
- Major features are organized under `src/app/`, with domain-specific folders (e.g., `transportation-plan`, `pages/rosters`, `persistence`).
- The top-level domain model is `TransportationPlan`, which encapsulates buses, rosters, routes, stops, students, and related context.
- Wizard flows (multi-step forms) use child routes and standalone step components under `src/app/transportation-plan/wizard-steps`.
- State management is signal-based (see `model()` and `signal()` usage), with services like `TransportationPlanService` and `BusService` handling persistence and reactive updates.

## Developer Workflows
- **Dev server:** `ng serve` (see README)
- **Build:** `ng build`
- **Unit tests:** `ng test`
- **Component generation:** Use Angular CLI (`ng generate component ...`)
- **Persistence:** Data is stored in local storage via services in `src/app/persistence/`.

## Project-Specific Patterns
- **Dependency Injection:** Use `readonly myService = inject(MyService);` at the top of the class, not in the constructor.
- **Inputs:** Use signal-based inputs: `readonly prop = input.required<Type>();`.
- **Forms:** Use signal bindings with `[(ngModel)]="model"` for reactive form fields. This requires a component import of `FormsModule`. The value that is bound to `ngModel` should be a declared like this: `readonly <name> = model(<defaultValue>);`.
- **Routing:** Use `RouterLink` for navigation buttons. For actions that mutate data, use click handlers.
- **Control Flow:** Prefer Angular's new syntax (`@for`, `@if`) over legacy `*ngFor`/`*ngIf`.
- **Component Structure:** Inline templates and styles for components <100 lines; delete unused `.html`/`.scss` files.
- **Wizard Navigation:** Wizard steps are child routes; the first step is naming the plan, followed by bus selection, etc.
- **Standalone Components:** All components should be standalone. But in the newest version of Angular, you don't need to import `CommonModule`. You also don't need to add `standalone: true` to the `@Component` decorator, as it's now the default.
- **Signals:** Use `signal()` for mutable state and `model()` for form-bound state. Use `effect()` for side effects based on signal changes. Do not use `BehaviorSubject` or `Observable` for state management. Do not set mutable state directly to class properties; always use signals.
- **CSS**: Before adding styles, ask if these are styles that should only apply to one component, or if they should be global styles. If they should be global styles (like how a button looks or form elements), add them to `src/styles.scss`. If they should only apply to one component (like unique layout), add them to that component's styles. Use CSS variables for colors and spacing defined in `src/styles.scss`.
- **Long files**: If a component file gets longer than 100 lines, consider breaking it up, either by making the template or styles be their own files, or extracting logical pieces into smaller components.
- **Unused code**: If you see any unused code (imports, variables, functions, etc.), remove it, unless there is a comment there explaining why it should still be there.

## Integration Points
- **Persistence:** All major entities (plans, buses, rosters, schools, stops) are persisted via signal-based services in `src/app/persistence`.
- **Cross-component communication:** State is shared via services and signals, not via global stores or event emitters.
- **External dependencies:** Uses `nanoid` for ID generation, `@ngx-pwa/local-storage` for persistence.

## Examples
- To add a new wizard step: create a standalone component in `wizard-steps`, add a child route, and update the wizard navbar.
- To add a new entity: create a signal-based service for persistence, and update the relevant wizard step/component.
- To wire up navigation: use `<button [routerLink]="['/plans', plan().id, 'name']">Edit</button>` for route-based navigation.

## Key Files & Directories
- `src/app/models.ts`: Domain models and interfaces
- `src/app/transportation-plan/`: Main feature, wizard, and services
- `src/app/persistence/`: Signal-based persistence services
- `src/app/pages/rosters/`: Example of legacy page structure

## Your Behavior

You should:

- If the user asks for a new feature, you can talk about your approach, but don't ask for permission to implement it. Just implement it.
- If the code doesn't compile, first check the whole file and see if you can fix it yourself. (Especially check for missing or too many closing curly braces.) If not, ask the user for help.
- Check the code base for patterns before implementing anything. Follow existing patterns.
- If the user points out an issue, bug, or inconsistency, you must fix it immediately. Do not ask if you should fix it—just do it.

You should not:

- Ask the user for permission before fixing an error, unless it changes the architecture or a major pattern.
- Implement anything in a way that breaks the rules above, unless you get permission.
- Ask if you should fix something the user has pointed out. Always fix it unless explicitly told not to.

The last thing you should do before ending your response is to check any changes you have made for consistency with the conventions above and that there aren't any compilation errors. Only leave them if you don't know how to fix them.

---

If any conventions or workflows are unclear, ask the user for clarification or examples before proceeding.
