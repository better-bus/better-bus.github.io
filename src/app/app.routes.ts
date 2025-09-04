import { Routes } from "@angular/router";
import { SeatsComponent } from "./pages/seats/seats.component";
import { Rosters } from "./pages/rosters/rosters";
import { SchoolsComponent } from "./pages/schools/schools";

export const routes: Routes = [
  { path: 'rosters', component: Rosters },
  { path: 'rosters/:id/seating', component: SeatsComponent },
  { path: 'schools', component: SchoolsComponent },
  { path: '', redirectTo: 'rosters', pathMatch: 'full' }
];
