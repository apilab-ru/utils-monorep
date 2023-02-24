import { Reducer } from './reducer';
import { Store } from '../store';
import { Library } from '@shared/models/library';
import { LibraryItem, MediaItem } from '@filecab/models';
import { deepCopy } from '@shared/utils/utils';
import { allApi } from '../api';
import { from, Observable, of, throwError } from 'rxjs';
import { chromeStoreApi } from "../api/chrome-store.api";

interface CRUDItem {
  path: string;
  item: LibraryItem;
}

export class LibraryReducer extends Reducer<Store> {

  update(store: Partial<Library>): Observable<void> {
    if (store.data !== undefined) {
      this.store.data.next(store.data);
    }

    if (store.lastTimeUpdate !== undefined) {
      this.store.lastTimeUpdate.next(store.lastTimeUpdate);
    }

    return from(chromeStoreApi.setStore<Library>({
      data: this.store.data.value,
      lastTimeUpdate: this.store.lastTimeUpdate.value
    }).then(() => undefined))
  }

  /*addItem({ path, item }: CRUDItem): Observable<void> {
    const data = deepCopy(this.store.data.getValue());

    if (!data[path]) {
      data[path] = [];
    }

    data[path].push(item);

    return this.updateStore(data);
  }

  updateItem({ path, item }: CRUDItem): Observable<void> {
    const data = deepCopy(this.store.data.getValue());

    if (!data[path]) {
      return throwError(() => `Path ${path} not found`);
    }

    const index = data[path].findIndex(it => it.item.id === item.item.id);

    if (index === -1) {
      return throwError(() => `Item ${item.item.id} not found`);
    }

    data[path][index] = item;

    return this.updateStore(data);
  }

  deleteItem({ path, item }: { path: string, item: MediaItem }): Observable<void> {
    const data = deepCopy(this.store.data.getValue());

    if (!data[path]) {
      return throwError(() => `Path ${path} not found`);
    }

    const index = data[path].findIndex(it => it.item.id === item.id);

    if (index === -1) {
      return throwError(() => `Item ${item.id} not found`);
    }

    data[path].splice(index, 1);

    return this.updateStore(data);
  }

  private updateStore(data: Record<string, LibraryItem[]>): Observable<void> {
    const lastTimeUpdate = new Date().getTime();
    const store = {
      data,
      tags: this.store.tags.getValue(),
      lastTimeUpdate,
    };

    this.store.data.next(data);
    return from(allApi.chromeStoreApi.setStore(store));
  }*/

}
