import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { NavigationItem } from '../../models';
import { MENU_ITEMS } from '../routing/menu-items';
import { structList } from '../routing/routes';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

  private items$ = new ReplaySubject<NavigationItem[]>(1);
  private pathSubject = new ReplaySubject<string>(1);
  private structItems = structList;

  constructor() {
    this.items$.next(MENU_ITEMS);
  }

  setPath(path: string): void {
    this.pathSubject.next(path);
  }

  get path$(): Observable<string> {
    return this.pathSubject.asObservable();
  }

  getItems(): Observable<NavigationItem[]> {
    return this.items$.asObservable();
  }

  getStruct(): Observable<NavigationItem[]> {
    return of(this.structItems);
  }
}
