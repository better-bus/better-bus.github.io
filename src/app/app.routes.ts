import { Routes, ActivatedRoute } from "@angular/router";
import { inject, computed } from '@angular/core';
import { SeatsComponent } from "./pages/seats/seats.component";
import { TransportationPlanService } from './transportation-plan/transportation-plan.service';
import { Rosters } from "./pages/rosters/rosters";
import { SchoolsComponent } from "./pages/schools/schools";
import { StopsComponent } from "./pages/stops/stops";
import { TransportationPlanPageComponent } from './transportation-plan/transportation-plan-page.component';
import { TransportationPlanWizardComponent } from './transportation-plan/transportation-plan-wizard.component';
import { SchoolStepComponent } from './transportation-plan/wizard-steps/school-step.component';
import { BusStepComponent } from './transportation-plan/wizard-steps/bus-step.component';
import { StopStepComponent } from './transportation-plan/wizard-steps/stop-step.component';
import { RouteStepComponent } from './transportation-plan/wizard-steps/route-step.component';
import { StudentStepComponent } from './transportation-plan/wizard-steps/student-step.component';
import { SeatingStepComponent } from './transportation-plan/wizard-steps/seating-step.component';
import { NameStepComponent } from './transportation-plan/wizard-steps/name-step.component';

export const routes: Routes = [
  { path: '', component: TransportationPlanPageComponent, pathMatch: 'full', title: 'Transportation Plans' },
  {
    path: 'plans/:id',
    component: TransportationPlanWizardComponent,
    data: {
      title: () => {
        const transportationPlanService = inject(TransportationPlanService);
        return computed(() => {
          const currentPlan = transportationPlanService.currentPlan();
          if (currentPlan?.name) {
            return currentPlan.name;
          } else {
            return 'Transportation Plan';
          }
        });
      }
    },
    children: [
      { path: 'name', component: NameStepComponent },
      { path: 'bus', component: BusStepComponent },
      { path: 'school', component: SchoolStepComponent },
      { path: 'stop', component: StopStepComponent },
      { path: 'route', component: RouteStepComponent },
      { path: 'student', component: StudentStepComponent },
      { path: 'seating', component: SeatingStepComponent },
      { path: '', redirectTo: 'name', pathMatch: 'full' }
    ]
  },
  { path: 'rosters', component: Rosters, title: 'Rosters' },
  { path: 'rosters/:id/seating', component: SeatsComponent, title: 'Seating Chart' },
  { path: 'schools', component: SchoolsComponent, title: 'Schools' },
  { path: 'stops', component: StopsComponent, title: 'Stops' }
];
