import { Component, inject, model, signal } from '@angular/core';
import { RostersService } from './rosters.service';
import { NgTemplateOutlet } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { Roster, Student } from '../../models';
import { ImportSheet } from "../../import-sheet/import-sheet";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rosters',
  imports: [NgTemplateOutlet, FormsModule, ImportSheet, RouterLink],
  templateUrl: './rosters.html',
  styleUrl: './rosters.scss'
})
export class Rosters {
  readonly rostersService = inject(RostersService);

  readonly newRosterForm = {
    name: signal<string>(''),
    schools: signal<string>(''),
  };
  readonly showNewRosterForm = signal(false);

  readonly rosters = this.rostersService.rosters;
  readonly selectedRoster = signal<Roster | null>(null);

  createNewRoster() {
    this.rostersService.addRoster({
      id: '', // will be set in service
      name: this.newRosterForm.name(),
      schoolIds: this.newRosterForm.schools().split(',').map(s => s.trim()).filter(s => s.length > 0),
      studentIds: [],
      stopAssignments: []
    });
    this.newRosterForm.name.set('');
    this.newRosterForm.schools.set('');
  }

  updateRoster(roster: Roster) {
    this.rostersService.updateRoster(roster);
  }

  async onStudentsChange(students: Student[]) {
    const selectedRoster = this.selectedRoster();
    if (!selectedRoster) return;

    await this.rostersService.updateStudents(students);
    this.rostersService.updateRoster({ ...selectedRoster, studentIds: students.map(s => s.id) });
  }
}
