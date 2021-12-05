import { Injectable, NgZone } from '@angular/core';
import { FileCab, ItemParam } from '@shared/services/file-cab';
import { from, Observable, of } from 'rxjs';
import { map, pluck, take } from 'rxjs/operators';
import { ISchema, ItemType, Library, LibraryItem } from '@shared/models/library';
import { runInZone } from '@shared/utils/run-in-zone';
import { NavigationItem } from '@shared/models/navigation';
import { Genre, SearchRequestResult } from '@server/api/base';
import { MetaData } from '@shared/models/meta-data';
import { Tag } from '@shared/models/tag';

interface FlatLibraryItem extends LibraryItem<ItemType> {
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileCabService {
  schemas$: Observable<Record<string, ISchema>>;
  types$: Observable<NavigationItem[]>;
  animeGenres$: Observable<Genre[]>;
  filmGenres$: Observable<Genre[]>;

  data$: Observable<Record<string, LibraryItem<ItemType>[]>>;
  tags$: Observable<Tag[]>;
  store$: Observable<Library>;

  private fileCab: FileCab;

  constructor(
    private ngZone: NgZone,
  ) {
    this.fileCab = window.chrome.extension.getBackgroundPage()['fileCab'];

    this.schemas$ = this.fileCab.config$.pipe(
      map(({ schemas }) => schemas),
      runInZone(this.ngZone),
    );
    this.types$ = this.fileCab.config$.pipe(
      map(({ types }) => types),
      runInZone(this.ngZone),
    );
    this.animeGenres$ = this.fileCab.animeGenres$;
    this.filmGenres$ = this.fileCab.filmGenres$;
    this.data$ = this.fileCab.store$.pipe(
      pluck('data'),
      runInZone(this.ngZone),
    );
    this.tags$ = this.fileCab.store$.pipe(
      pluck('tags'),
      runInZone(this.ngZone),
    );

    this.store$ = this.fileCab.store$.pipe(
      runInZone(this.ngZone),
    );
  }

  searchByUrl(url: string, name: string): Observable<{ type: string, id: number, name: string } | null> {
    return this.data$.pipe(
      take(1),
      map(store => {
        const list = this.flatStore(store);
        const item = list.find(it => it.url === url && (it.name === name || it.item.original_title === name));

        if (item) {
          return {
            type: item.type,
            id: item.item.id,
            name: item.name || item.item.title,
          };
        }

        return null;
      }),
    );
  }

  selectGenres(type: string): Observable<Genre[]> {
    return this.fileCab.selectGenres(type).pipe(
      runInZone(this.ngZone),
    );
  }

  searchInStore(
    path: string,
    item: ItemParam,
  ): Observable<LibraryItem<ItemType> | null> {
    return this.fileCab.searchInStore(path, item).pipe(
      runInZone(this.ngZone),
    );
  }

  checkExisted(path: string, item: ItemParam): Observable<boolean> {
    return this.fileCab.checkExisted(path, item).pipe(
      take(1),
      runInZone(this.ngZone),
    );
  }

  private flatStore(store: Record<string, LibraryItem<ItemType>[]>): FlatLibraryItem[] {
    return Object.entries(store)
      .reduce((all, [type, list]) => ([
        ...all, ...list.map(item => ({ ...item, type })),
      ]), []);
  }

  addOrUpdate(path: string, item: ItemType, metaData: MetaData): Observable<LibraryItem<ItemType>> {
    return this.fileCab.addOrUpdate(path, item, metaData).pipe(
      runInZone(this.ngZone),
    );
  }

  addItemLibToStore(path: string, item: LibraryItem<ItemType>): Observable<void> {
    return from(this.fileCab.addItemLibToStore(path, item)).pipe(
      runInZone(this.ngZone),
    );
  }

  searchApi(path: string | undefined, name: string): Observable<SearchRequestResult<ItemType>> {
    return !path ? of({
      page: 1,
      total_pages: 1,
      total_results: 0,
      results: [],
    }) : this.fileCab.searchApi(path, name).pipe(
      runInZone(this.ngZone),
    );
  }

  loadById(path: string, id: number): Observable<ItemType> {
    return this.fileCab.loadById(path, id).pipe(
      runInZone(this.ngZone),
    );
  }

  deleteItem(path: string, id: number): void {
    return this.fileCab.deleteItem(path, id);
  }

  updateItem(path: string, id: number, item): LibraryItem<ItemType> {
    return this.fileCab.updateItem(path, id, item);
  }

  updateStore(store: Library): void {
    return this.fileCab.updateStore(store);
  }
}
