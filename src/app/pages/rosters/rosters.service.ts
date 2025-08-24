import { effect, inject, Injectable, signal } from "@angular/core";
import { nanoid } from 'nanoid';
import { PERSISTENCE } from "../../persistence/persistence.provider";
import { Roster } from "../../models";

@Injectable({
  providedIn: "root",
})
export class RostersService {

  private readonly persistence = inject(PERSISTENCE);
  private loaded = false;

  readonly rosters = signal<Roster[]>([]);

  constructor() {
    this.load();

    effect(() => {
      const rosters = this.rosters();
      if (this.loaded) {
        this.persistence.saveData("rosters", rosters);
      }
    });
  }

  private async load() {
    this.loaded = false;
    const data = await this.persistence.getData<Roster[]>("rosters");
    console.log("Loaded rosters", data);
    this.rosters.set(data ?? []);
    this.loaded = true;
  }

  addRoster(roster: Roster) {
    this.rosters.update((rosters) => [...rosters, { ...roster, id: nanoid() }]);
  }

  updateRoster(roster: Roster) {
    this.rosters.update((rosters) => rosters.map((r) => r.id === roster.id ? roster : r));
  }

  deleteRoster(id: string) {
    this.rosters.update((rosters) => rosters.filter((roster) => roster.id !== id));
  }
}
