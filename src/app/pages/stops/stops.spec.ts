import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StopsComponent } from './stops';

describe('StopsComponent', () => {
  let component: StopsComponent;
  let fixture: ComponentFixture<StopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StopsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a list of stops', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('.stop-card').length).toBe(component.stops.length);
  });
});
