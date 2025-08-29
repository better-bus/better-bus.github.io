import { Routes } from "@angular/router";
import { SeatsComponent } from "./pages/seats/seats.component";
import { Rosters } from "./pages/rosters/rosters";

export const routes: Routes = [
  { path: 'rosters', component: Rosters },
  { path: 'rosters/:id/seating', component: SeatsComponent },
  { path: '', redirectTo: 'rosters', pathMatch: 'full' }
];
