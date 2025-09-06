
import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { nanoid } from 'nanoid';
import { PERSISTENCE } from "../persistence/persistence.provider";
import { TransportationPlan } from "../models";
import {RouteStateSignalService} from '../routing/route-signal.service'

const STORAGE_KEY = 'transportationPlans';

@Injectable({ providedIn: "root" })
export class TransportationPlanService {
  private readonly persistence = inject(PERSISTENCE);
  private readonly routingService = inject(RouteStateSignalService);
  private loaded = false;

  readonly plans = signal<TransportationPlan[]>([]);
  readonly currentPlan = computed(() => {
    const route = this.routingService.currentRoute();
    let node = route?.root ?? null;
    let id: string | null = null;
    while (node && !id) {
      id = node.params['id'] ? node.params['id'] : null;
      node = node.firstChild;
    }
    const plans = this.plans();
    return plans.find(plan => plan.id === id);
  });

  constructor() {
    this.load();

    effect(() => {
      const plans = this.plans();
      if (this.loaded) {
        this.persistence.saveData(STORAGE_KEY, plans);
      }
    });
  }

  private async load() {
    this.loaded = false;
    const data = await this.persistence.getData<TransportationPlan[]>(STORAGE_KEY);
    this.plans.set(data ?? []);
    await new Promise<void>((resolve) => setTimeout(resolve));
    this.loaded = true;
  }

  addPlan(plan: TransportationPlan) {
    this.plans.update((plans) => [...plans, { ...plan, id: nanoid() }]);
  }

  updatePlan(plan: TransportationPlan) {
    this.plans.update((plans) => plans.map((p) => p.id === plan.id ? plan : p));
  }

  deletePlan(id: string) {
    this.plans.update((plans) => plans.filter((plan) => plan.id !== id));
  }

  createNewPlan(data: Partial<TransportationPlan>): TransportationPlan {
    return {
      id: nanoid(),
      schools: [],
      bus: data.bus!,
      stops: [],
      students: [],
      routes: [],
      roster: data.roster!,
      seatAssignments: [],
      schedules: [],
      name: data.name || '',
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentBusContexts: []
    };
  }
}
