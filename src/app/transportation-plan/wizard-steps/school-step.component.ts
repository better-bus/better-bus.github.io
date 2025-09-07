
import { Component, effect, inject, signal, model } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SchoolsService } from '../../pages/schools/schools.service';
import { School, Grade } from '../../models';
import { FormsModule } from '@angular/forms';
import { TransportationPlanService } from '../transportation-plan.service';

function parseGrades(gradesStr: string | undefined): Grade[] {
  return gradesStr?.split(',').map(g => g.trim() as Grade).filter(g => g.length > 0) ?? [];
}

@Component({
  selector: 'app-school-step',
  imports: [FormsModule, RouterModule],
  template: `
    <h2>Step: Schools</h2>
    @if (!editingSchool()) {
      <button type="button" (click)="startAdd()">Add School</button>
    }
    @if (editingSchool()) {
      <form (ngSubmit)="saveSchool()" style="margin-bottom: 1rem;">
        <div>
          <label>Name:</label>
          <input [(ngModel)]="name" name="name" required (input)="saveSchool()" />
        </div>
        <div>
          <label>Abbreviation:</label>
          <input [(ngModel)]="abbreviation" name="abbreviation" (input)="saveSchool()" />
        </div>
        <div>
          <label>Address:</label>
          <input [(ngModel)]="address" name="address" required (input)="saveSchool()" />
        </div>
        <div>
          <label>Location (lat,lng):</label>
          <input [(ngModel)]="location" name="location" required (input)="saveSchool()" />
        </div>
        <div>
          <label>Type:</label>
          <select [(ngModel)]="type" name="type" (input)="saveSchool()">
            <option value="Preschool">Preschool</option>
            <option value="Elementary">Elementary</option>
            <option value="Middle">Middle</option>
            <option value="High">High</option>
            <option value="K-8">K-8</option>
            <option value="K-12">K-12</option>
          </select>
        </div>
        <div>
          <label>Grades (comma separated):</label>
          <input [(ngModel)]="grades" name="grades" required (input)="saveSchool()" />
        </div>
        <button type="submit">Save</button>
        <button type="button" (click)="cancelEdit()">Cancel</button>
      </form>
    }

    <ul>
      @for (school of schools(); track school.id) {
        <li style="display: flex; align-items: center;">
          <input type="checkbox" [checked]="selectedSchoolIds().includes(school.id)" (change)="toggleSchoolSelection(school.id, $event.target.checked)" />
          <span style="flex: 1; margin-left: 0.5rem;">
            <strong>{{ school.name }}</strong> ({{ school.type }})<br />
            {{ school.address }}<br />
            Grades: {{ school.grades.join(', ') }}
          </span>
          <button type="button" (click)="editSchool(school)">Edit</button>
          <button type="button" (click)="deleteSchool(school.id)">Remove</button>
        </li>
      }
    </ul>
    <div style="margin-top: 2rem;">
      <button [routerLink]="['../stops']">Next</button>
    </div>
  `,
  styles: `
    h2 { margin-bottom: 1rem; }
    form { margin-bottom: 1rem; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 0.5rem; }
    button { margin-right: 0.5rem; }
    label { display: inline-block; width: 120px; }
    input, select { margin-bottom: 0.5rem; }
  `
})
export class SchoolStepComponent {
  readonly schoolsService = inject(SchoolsService);
  readonly planService = inject(TransportationPlanService);
  readonly schools = this.schoolsService.schools;

  // Signals for form fields
  readonly name = model('');
  readonly abbreviation = model('');
  readonly address = model('');
  readonly location = model('');
  readonly type = model<School['type']>('Elementary');
  readonly grades = model('');

  // Signal for selected school IDs for the plan
  readonly selectedSchoolIds = model<string[]>([]);

  // Signal for editing state (null for add, school for edit, false for none)
  readonly editingSchool = model<School | null>(null);

  constructor() {
    effect(() => {
      const plan = this.planService.currentPlan();
      if (plan) {
        // Load selected school IDs from the plan
        this.selectedSchoolIds.set(plan.schools.map(s => s.id));
      }
    });
  }

  startAdd() {
    this.editingSchool.set({
      id: '',
      name: '',
      abbreviation: '',
      address: '',
      location: [0, 0],
      type: 'Elementary',
      grades: [],
    });
    this.name.set('');
    this.abbreviation.set('');
    this.address.set('');
    this.location.set('');
    this.type.set('Elementary');
    this.grades.set('');
  }

  editSchool(school: School) {
    this.editingSchool.set(school);
    this.name.set(school.name);
    this.abbreviation.set(school.abbreviation ?? '');
    this.address.set(school.address);
    this.location.set(school.location ? `${school.location[0]},${school.location[1]}` : '');
    this.type.set(school.type);
    this.grades.set(school.grades ? school.grades.join(',') : '');
  }

  cancelEdit() {
    this.editingSchool.set(null);
    this.name.set('');
    this.abbreviation.set('');
    this.address.set('');
    this.location.set('');
    this.type.set('Elementary');
    this.grades.set('');
  }

  saveSchool() {
    const locStr = this.location();
    let location: [number, number] = [0, 0];
    if (locStr) {
      const parts = locStr.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        location = [parts[0], parts[1]];
      }
    }
    const gradesArr = parseGrades(this.grades());
    const schoolObj: School = {
      id: this.editingSchool()?.id ?? '',
      name: this.name(),
      abbreviation: this.abbreviation(),
      address: this.address(),
      location,
      type: this.type(),
      grades: gradesArr,
    };
    if (!schoolObj.name || !schoolObj.address || !schoolObj.location || gradesArr.length === 0) {
      return;
    }
    if (!schoolObj.id || schoolObj.id === '') {
      this.schoolsService.addSchool(schoolObj);
    } else {
      this.schoolsService.updateSchool(schoolObj);
    }
    this.cancelEdit();
  }

  deleteSchool(id: string) {
    this.schoolsService.deleteSchool(id);
    // Also remove from selectedSchoolIds if present
    this.selectedSchoolIds.set(this.selectedSchoolIds().filter(sid => sid !== id));
    this.updatePlanSchools();
    if (this.editingSchool() && this.editingSchool()!.id === id) {
      this.cancelEdit();
    }
  }

  toggleSchoolSelection(id: string, checked: boolean) {
    const current = this.selectedSchoolIds();
    let updated: string[];
    if (checked) {
      updated = current.includes(id) ? current : [...current, id];
    } else {
      updated = current.filter(sid => sid !== id);
    }
    this.selectedSchoolIds.set(updated);
    this.updatePlanSchools();
  }

  updatePlanSchools() {
    const plan = this.planService.currentPlan();
    if (!plan) return;
    // Get all schools by ID
    const allSchools = this.schools();
    const selectedSchools = allSchools.filter(s => this.selectedSchoolIds().includes(s.id));
    const updatedPlan = { ...plan, schools: selectedSchools };
    this.planService.updatePlan(updatedPlan);
  }
}

