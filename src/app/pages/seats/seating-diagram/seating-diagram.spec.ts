import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatingDiagram } from './seating-diagram';

describe('SeatingDiagram', () => {
  let component: SeatingDiagram;
  let fixture: ComponentFixture<SeatingDiagram>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatingDiagram]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatingDiagram);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
