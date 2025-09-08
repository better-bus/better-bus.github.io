import { Component, output, signal } from '@angular/core';
import * as XLSX from 'xlsx';
import { Grade, School, Student } from '../models';

@Component({
  selector: 'app-import-sheet',
  imports: [],
  templateUrl: './import-sheet.html',
  styleUrl: './import-sheet.scss'
})
export class ImportSheet {
  // Emit array of { student, stopId }
  readonly studentsChange = output<{ student: Student, stopId: string }[]>();

  selectedFileName = signal('');

  async onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      this.selectedFileName.set(file.name);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const studentEntries = rows.map((row: any) => ({
        ...row,
        PreferredName: row.Nickname ? row.Nickname : row.Name,
      })).map((row: any, index: number, array: any[]) => ({
        ...row,
        DisplayName: array.filter((r: any) => r.PreferredName === row.PreferredName).length === 1 ? row.PreferredName : `${row.PreferredName} ${row.Surname?.[0]}`.trim(),
        HouseMates: array.filter((r: any) => r !== row && !!r.Address && r.Address === row.Address).map((r: any) => r.uid),
        StopId: row.Stop // Parse Stop column (should be stop.id)
      }));

      workbook.Workbook = {
        ...workbook.Workbook,
        Names: [...(workbook.Workbook?.Names ?? []), { Name: file.name, Ref: 'StudentEntries!A1' }]
      };

      const studentsWithStop = studentEntries.map((row: any) => ({
        student: {
          id: row.uid,
          name: `${row.Name} ${row.Surname}`,
          displayName: row.DisplayName,
          address: row.Address,
          contact: {
            name: row['Contact Name'],
            phone: row['Contact Phone']
          },
          grade: row.Grade == '0' ? 'K' : row.Grade as Grade,
          school: {} as School, // to be filled in later
          housemateIds: row.HouseMates
        },
        stopId: row.StopId || ''
      }));
      console.log('Imported students with stop', studentsWithStop);

      this.studentsChange.emit(studentsWithStop);
    }
  }
}

