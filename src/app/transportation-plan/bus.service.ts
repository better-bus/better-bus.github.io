import { effect, inject, Injectable, signal } from "@angular/core";
import { nanoid } from 'nanoid';
import { PERSISTENCE } from "../persistence/persistence.provider";
import { Bus } from "../models";

const STORAGE_KEY = 'buses';

@Injectable({ providedIn: "root" })
export class BusService {
  private readonly persistence = inject(PERSISTENCE);
  private loaded = false;

  readonly buses = signal<Bus[]>([]);

  constructor() {
    this.load();

    effect(() => {
      const buses = this.buses();
      if (this.loaded) {
        this.persistence.saveData(STORAGE_KEY, buses);
      }
    });
  }

  private async load() {
    this.loaded = false;
    const data = await this.persistence.getData<Bus[]>(STORAGE_KEY);
    this.buses.set(data ?? []);
    await new Promise<void>((resolve) => setTimeout(resolve));
    this.loaded = true;
  }

  addBus(bus: Bus) {
    this.buses.update((buses) => [...buses, { ...bus, number: bus.number ?? nanoid() }]);
  }

  updateBus(bus: Bus) {
    this.buses.update((buses) => buses.map((b) => b.number === bus.number ? bus : b));
  }

  deleteBus(number: number) {
    this.buses.update((buses) => buses.filter((bus) => bus.number !== number));
  }
}
