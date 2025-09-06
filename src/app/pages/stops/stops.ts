import { Component, effect, inject, signal } from '@angular/core';
import { SideOfStreet, Stop } from '../../models';
import { NgTemplateOutlet } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { StopsService } from './stops.service';

@Component({
  selector: 'app-stops',
  imports: [NgTemplateOutlet, FormsModule],
  templateUrl: './stops.html',
  styleUrls: ['./stops.scss']
})
export class StopsComponent {
  readonly stopsService = inject(StopsService);

  readonly showNewStopForm = signal(false);
  readonly stops = this.stopsService.stops;
  readonly selectedStop = signal<Stop | null>(null);

  readonly editStopForm = {
    id: signal<string | undefined>(undefined),
    nickname: signal<string | undefined>(undefined),
    address: signal<string | undefined>(undefined),
    location: signal<string | undefined>(undefined),
    sideOfStreet: signal<string | undefined>(undefined),
    notes: signal<string | undefined>(undefined),
  };

  constructor() {
    effect(() => {
      const selected = this.selectedStop();
      if (selected) {
        this.populateEditForm(selected);
      } else {
        this.populateEditForm(undefined);
      }
    });
  }

  // Public methods
  selectStop(stop: Stop) {
    this.selectedStop.set(stop);
    this.populateEditForm(stop);
  }

  deleteStop(id: string) {
    this.stopsService.deleteStop(id);
  }

  saveStop() {
    const locStr = this.editStopForm.location();
    let location: [number, number] = [0, 0];
    if (locStr) {
      const parts = locStr.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        location = [parts[0], parts[1]];
      }
    }
    const sideOfStreet = this.editStopForm.sideOfStreet()?.split(',').map(s => s.trim() as SideOfStreet) ?? [];
    const updatedStop: Partial<Stop> = {
      id: this.editStopForm.id(),
      nickname: this.editStopForm.nickname(),
      address: this.editStopForm.address(),
      location,
      sideOfStreet,
      notes: this.editStopForm.notes(),
    };
    if (!updatedStop.nickname || !updatedStop.address || !updatedStop.location || sideOfStreet.length === 0) {
      throw new Error('Please fill out all required fields.');
    }
    if (updatedStop.id) {
      this.stopsService.updateStop(updatedStop as Stop);
    } else {
      this.stopsService.addStop(updatedStop as Stop);
    }

    // Clear and close the new stop form
    this.showNewStopForm.set(false);
    this.editStopForm.id.set(undefined);
    this.editStopForm.nickname.set(undefined);
    this.editStopForm.address.set(undefined);
    this.editStopForm.location.set(undefined);
    this.editStopForm.sideOfStreet.set(undefined);
    this.editStopForm.notes.set(undefined);
  }

  // Private methods
  private populateEditForm(stop: Stop | undefined) {
    this.editStopForm.id.set(stop?.id ?? undefined);
    this.editStopForm.nickname.set(stop?.nickname ?? undefined);
    this.editStopForm.address.set(stop?.address ?? undefined);
    this.editStopForm.location.set(stop?.location ? `${stop.location[0]},${stop.location[1]}` : undefined);
    this.editStopForm.sideOfStreet.set(stop?.sideOfStreet ? stop.sideOfStreet.join(',') : undefined);
    this.editStopForm.notes.set(stop?.notes ?? undefined);
  }
}
