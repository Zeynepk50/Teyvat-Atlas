import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Character, CharacterDetail } from '../models/character.model';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private readonly BASE = 'https://genshin.jmp.blue';
  readonly PAGE_SIZE = 20;

  private cache: Character[] = [];
  private cacheLoaded = false;

  constructor(private http: HttpClient) {}

  private buildCharacter(id: string, detail: CharacterDetail): Character {
    return {
      id,
      name: detail.name,
      element: detail.element?.toLowerCase() as any,
      weapon: detail.weapontype?.toLowerCase() as any,
      rarity: (parseInt(detail.rarity) as 4 | 5) || 4,
      nation: detail.nation,
      affiliation: detail.affiliation,
      description: detail.description,
      iconUrl: `${this.BASE}/characters/${id}/icon`,
      portraitUrl: `${this.BASE}/characters/${id}/portrait`,
    };
  }

  private loadAll(): Observable<Character[]> {
    if (this.cacheLoaded) return of(this.cache);

    return this.http.get<string[]>(`${this.BASE}/characters`).pipe(
      switchMap((ids) => {
        const requests = ids.map((id) =>
          this.http.get<CharacterDetail>(`${this.BASE}/characters/${id}`).pipe(
            map((detail) => this.buildCharacter(id, detail))
          )
        );
        return forkJoin(requests);
      }),
      tap((chars) => {
        this.cache = chars;
        this.cacheLoaded = true;
      })
    );
  }

  getPage(page: number): Observable<{ characters: Character[]; total: number }> {
    return this.loadAll().pipe(
      map((all) => {
        const start = (page - 1) * this.PAGE_SIZE;
        return {
          characters: all.slice(start, start + this.PAGE_SIZE),
          total: all.length,
        };
      })
    );
  }

  search(query: string, page: number): Observable<{ characters: Character[]; total: number }> {
    return this.loadAll().pipe(
      map((all) => {
        const q = query.toLowerCase().trim();
        const filtered = all.filter((c) => {
          const name = (c.name || '').toLowerCase();
          const element = (c.element || '').toLowerCase();
          const weapon = (c.weapon || '').toLowerCase();
          return name.includes(q) || element.includes(q) || weapon.includes(q);
        });
        const start = (page - 1) * this.PAGE_SIZE;
        return {
          characters: filtered.slice(start, start + this.PAGE_SIZE),
          total: filtered.length,
        };
      })
    );
  }
}
