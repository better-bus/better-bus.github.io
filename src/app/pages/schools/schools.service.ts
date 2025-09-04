import { effect, inject, Injectable, signal } from "@angular/core";
import { nanoid } from 'nanoid';
import { PERSISTENCE } from "../../persistence/persistence.provider";
import { School } from "../../models";

const STORAGE_KEY = 'schools';

@Injectable({
  providedIn: "root",
})
export class SchoolsService {
  private readonly persistence = inject(PERSISTENCE);
  private loaded = false;

  readonly schools = signal<School[]>([]);

  constructor() {
    this.load();
    effect(() => {
      const schools = this.schools();
      if (this.loaded) {
        this.persistence.saveData(STORAGE_KEY, schools);
      }
    });
  }

  private async load() {
    this.loaded = false;
    const data = await this.persistence.getData<School[]>(STORAGE_KEY);
    this.schools.set(data ?? []);
    await new Promise<void>((resolve) => setTimeout(resolve));
    this.loaded = true;
  }

  addSchool(school: School) {
    this.schools.update((schools) => [...schools, { ...school, id: nanoid() }]);
  }

  updateSchool(school: School) {
    this.schools.update((schools) => schools.map((s) => s.id === school.id ? school : s));
  }

  deleteSchool(id: string) {
    this.schools.update((schools) => schools.filter((school) => school.id !== id));
  }
}
