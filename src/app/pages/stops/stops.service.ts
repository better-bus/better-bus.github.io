import { Injectable } from '@angular/core';
import { Stop } from '../../models';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StopsService {
  private stopsList = signal<Stop[]>([]);

  get stops() {
    return this.stopsList;
  }

  addStop(stop: Stop) {
    const updatedStops = [...this.stopsList(), { ...stop, id: this.generateId() }];
    this.stopsList.set(updatedStops);
  }

  updateStop(updatedStop: Stop) {
    const updatedStops = this.stopsList().map((stop) =>
      stop.id === updatedStop.id ? updatedStop : stop
    );
    this.stopsList.set(updatedStops);
  }

  deleteStop(id: string) {
    const updatedStops = this.stopsList().filter((stop) => stop.id !== id);
    this.stopsList.set(updatedStops);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
