import { Component, inject, model, signal } from '@angular/core';
import { RostersService } from './rosters.service';
import { NgTemplateOutlet } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { Roster } from '../../models';

@Component({
  selector: 'app-rosters',
  imports: [NgTemplateOutlet, FormsModule],
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
}
