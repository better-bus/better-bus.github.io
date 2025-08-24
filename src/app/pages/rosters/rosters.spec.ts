import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rosters } from './rosters';

describe('Rosters', () => {
  let component: Rosters;
  let fixture: ComponentFixture<Rosters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rosters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rosters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
