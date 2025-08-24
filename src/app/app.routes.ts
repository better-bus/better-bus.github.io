import { Routes } from "@angular/router";
import { SeatsComponent } from "./pages/seats/seats.component";
import { Rosters } from "./pages/rosters/rosters";

export const routes: Routes = [
  { path: 'seats', component: SeatsComponent },
  { path: 'rosters', component: Rosters },
  { path: '', redirectTo: 'rosters', pathMatch: 'full' }
];
