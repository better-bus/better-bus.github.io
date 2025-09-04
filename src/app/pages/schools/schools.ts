import { Component, effect, inject, signal } from '@angular/core';
import { SchoolsService } from './schools.service';
import { NgTemplateOutlet } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { School, Grade } from '../../models';

function parseGrades(gradesStr: string | undefined): Grade[] {
  return gradesStr?.split(',').map(g => g.trim() as Grade).filter(g => g.length > 0) ?? [];
}
function formatGrades(grades: Grade[]): string {
  if (typeof grades === 'string') {
    return grades;
  }
  return grades.join(',');
}

@Component({
  selector: 'app-schools',
  imports: [NgTemplateOutlet, FormsModule],
  templateUrl: './schools.html',
  styleUrls: ['./schools.scss']
})
export class SchoolsComponent {
  readonly schoolsService = inject(SchoolsService);

  readonly showNewSchoolForm = signal(false);
  readonly schools = this.schoolsService.schools;
  readonly selectedSchool = signal<School | null>(null);

  readonly editSchoolForm = {
    id: signal<string | undefined>(undefined),
    name: signal<string | undefined>(undefined),
    abbreviation: signal<string | undefined>(undefined),
    address: signal<string | undefined>(undefined),
    location: signal<string | undefined>(undefined),
    type: signal<School["type"]>('Elementary'),
    grades: signal<string | undefined>(undefined),
  };

  constructor() {
    effect(() => {
      const selected = this.selectedSchool();
      if (selected) {
        this.populateEditForm(selected);
      } else {
        this.populateEditForm(undefined);
      }
    })
  }

  // Public methods
  selectSchool(school: School) {
    this.selectedSchool.set(school);
    this.populateEditForm(school);
  }

  deleteSchool(id: string) {
    this.schoolsService.deleteSchool(id);
  }

  saveSchool() {
    const locStr = this.editSchoolForm.location();
    let location: [number, number] = [0, 0];
    if (locStr) {
      const parts = locStr.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        location = [parts[0], parts[1]];
      }
    }
    const grades = parseGrades(this.editSchoolForm.grades());
    const updatedSchool: Partial<School> = {
      id: this.editSchoolForm.id(),
      name: this.editSchoolForm.name(),
      abbreviation: this.editSchoolForm.abbreviation(),
      address: this.editSchoolForm.address(),
      location,
      type: this.editSchoolForm.type(),
      grades,
    };
    if (!updatedSchool.name || !updatedSchool.address || !updatedSchool.location || grades.length === 0) {
      throw new Error('Please fill out all required fields.');
    }
    if (updatedSchool.id) {
      this.schoolsService.updateSchool(updatedSchool as School);
    } else {
      this.schoolsService.addSchool(updatedSchool as School);
    }

    // Clear and close the new school form
    this.showNewSchoolForm.set(false);
    this.editSchoolForm.id.set(undefined);
    this.editSchoolForm.name.set(undefined);
    this.editSchoolForm.abbreviation.set(undefined);
    this.editSchoolForm.address.set(undefined);
    this.editSchoolForm.location.set(undefined);
    this.editSchoolForm.type.set('Elementary');
    this.editSchoolForm.grades.set(undefined);
  }

  // Private methods
  private populateEditForm(school: School | undefined) {
    console.log('Populating edit form with', school);
    this.editSchoolForm.id.set(school?.id ?? undefined);
    this.editSchoolForm.name.set(school?.name ?? undefined);
    this.editSchoolForm.abbreviation.set(school?.abbreviation ?? undefined);
    this.editSchoolForm.address.set(school?.address ?? undefined);
    this.editSchoolForm.location.set(school?.location ? `${school.location[0]},${school.location[1]}` : undefined);
    this.editSchoolForm.type.set(school?.type ?? 'Elementary');
    this.editSchoolForm.grades.set(school?.grades ? formatGrades(school.grades) : undefined);
  }
}
