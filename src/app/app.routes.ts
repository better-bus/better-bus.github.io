import { Routes, Route } from "@angular/router";
import { inject, computed } from '@angular/core';
import { TransportationPlanService } from './transportation-plan/transportation-plan.service';
import { TransportationPlanPageComponent } from './transportation-plan/transportation-plan-page.component';
import { TransportationPlanWizardComponent } from './transportation-plan/transportation-plan-wizard.component';
import { SchoolStepComponent } from './transportation-plan/wizard-steps/school-step.component';
import { BusStepComponent } from './transportation-plan/wizard-steps/bus-step.component';
import { StopStepComponent } from './transportation-plan/wizard-steps/stop-step.component';
import { RouteScheduleStepComponent } from './transportation-plan/wizard-steps/route-step.component';
import { StudentStepComponent } from './transportation-plan/wizard-steps/student-step.component';
import { SeatingStepComponent } from './transportation-plan/wizard-steps/seating-step.component';
import { NameStepComponent } from './transportation-plan/wizard-steps/name-step.component';

export const plansRoute: Route = {
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
    { path: 'schools', component: SchoolStepComponent, data: { displayName: 'Schools & Grades' } },
    { path: 'stops', component: StopStepComponent },
    { path: 'routes', component: RouteScheduleStepComponent, data: { displayName: 'Route Schedules' } },
    { path: 'students', component: StudentStepComponent },
  { path: 'seating', component: SeatingStepComponent },
  { path: 'checklist', component: (await import('./transportation-plan/wizard-steps/checklist/checklist-step.component')).ChecklistStepComponent, data: { displayName: 'Checklist' } },
  { path: '', redirectTo: 'name', pathMatch: 'full' }
  ]
}

export const routes: Routes = [
  { path: '', component: TransportationPlanPageComponent, pathMatch: 'full', title: 'Transportation Plans' },
  plansRoute,
];
