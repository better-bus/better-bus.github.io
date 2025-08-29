import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportSheet } from './import-sheet';

describe('ImportSheet', () => {
  let component: ImportSheet;
  let fixture: ComponentFixture<ImportSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportSheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
