import { Injectable } from "@angular/core";
import { TitleStrategy } from "@angular/router";

@Injectable({providedIn: 'root'})
export class CustomTitleStrategy extends TitleStrategy {
  override updateTitle = () => {};
  override buildTitle = () => '';
  override getResolvedTitleForRoute = () => '';
}
