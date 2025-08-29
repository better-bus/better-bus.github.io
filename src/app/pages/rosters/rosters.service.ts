import { effect, inject, Injectable, signal } from "@angular/core";
import { nanoid } from 'nanoid';
import { PERSISTENCE } from "../../persistence/persistence.provider";
import { Roster, Student } from "../../models";

const STORAGE_KEY = 'rosters';
const STUDENT_STORAGE_KEY = (id: string) => `student_${id}`;

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
        this.persistence.saveData(STORAGE_KEY, rosters);
      }
    });
  }

  private async load() {
    this.loaded = false;
    const data = await this.persistence.getData<Roster[]>(STORAGE_KEY);
    console.log("Loaded rosters", data);
    this.rosters.set(data ?? []);
    await new Promise<void>((resolve) => setTimeout(resolve));
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

  async getStudent(uid: string): Promise<Student | undefined> {
    return this.persistence.getData<Student>(STUDENT_STORAGE_KEY(uid));
  }

  async updateStudents(students: Student[]) {
    await Promise.all(students.map((student) => this.persistence.saveData(STUDENT_STORAGE_KEY(student.id), student)));
    console.log('student data saved');
  }
}
