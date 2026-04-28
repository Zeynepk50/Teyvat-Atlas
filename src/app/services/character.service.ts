import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
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
      name: detail.name || id,
      element: this.getElementFromDetail(detail),
      weapon: this.getWeaponFromDetail(detail),
      rarity: (parseInt((detail as any).rarity || detail.rarity) as 4 | 5) || 4,
      nation: (detail as any).nation || detail.nation,
      affiliation: (detail as any).affiliation || detail.affiliation,
      description: (detail as any).description || detail.description,
      iconUrl: (detail as any).iconUrl || (detail as any).icon || `${this.BASE}/characters/${id}/icon`,
      portraitUrl: (detail as any).portraitUrl || (detail as any).portrait || `${this.BASE}/characters/${id}/portrait`,
    };
  }

  private normalizeElement(el?: string) {
    if (!el) return 'geo';
    const v = el.toLowerCase().trim();

    // common synonyms mapping
    const synonyms: Record<string, string> = {
      wind: 'anemo',
      breeze: 'anemo',
      thunder: 'electro',
      lightning: 'electro',
      ice: 'cryo',
      frost: 'cryo',
      earth: 'geo',
      stone: 'geo',
      wood: 'dendro',
      grass: 'dendro',
      fire: 'pyro',
      flame: 'pyro',
      water: 'hydro',
      aqua: 'hydro',
    };

    const mapped = synonyms[v] || v;
    const allowed = ['pyro', 'hydro', 'anemo', 'electro', 'dendro', 'cryo', 'geo'];
    return (allowed.includes(mapped) ? (mapped as any) : 'geo');
  }

  private getElementFromDetail(detail: any) {
    if (!detail) return 'geo';
    // try several possible fields that APIs might use
    const candidates = [
      detail.element,
      detail.vision,
      detail.vision_type,
      detail.visionType,
      detail.element_type,
      detail.elementType,
    ];

    for (const c of candidates) {
      if (c) return this.normalizeElement(c as string);
    }

    // sometimes API returns nested objects
    if (detail.attributes && detail.attributes.vision) return this.normalizeElement(detail.attributes.vision);

    return 'geo';
  }

  private getWeaponFromDetail(detail: any) {
    if (!detail) return 'sword';

    const candidates = [
      detail.weapontype,
      detail.weapon,
      detail.weapon_type,
      detail.weaponType,
      detail.type,
    ];



    ////tüm karakterlein sword olmasını engellemek için ekledim, bazı karakterlerde weaponType alanı var ama bazılarında yoktu, bu yüzden farklı alanları deniyorum.
    for (const c of candidates) {
      if (c) return this.normalizeWeapon(c as string);
    }

    if (detail.attributes && detail.attributes.weapon) return this.normalizeWeapon(detail.attributes.weapon);

    return 'sword';
  }

  private normalizeWeapon(w?: string) {
    if (!w) return 'sword';
    const v = w.toLowerCase().trim();
    const allowed = ['sword', 'claymore', 'polearm', 'bow', 'catalyst'];
    return (allowed.includes(v) ? v : 'sword') as any;
  }

  private loadAll(): Observable<Character[]> {
    if (this.cacheLoaded) return of(this.cache);

    return forkJoin([
      this.http.get<string[]>(`${this.BASE}/characters`).pipe(catchError(() => of([] as string[]))),
      this.http.get<any[]>('assets/characters.json').pipe(catchError(() => of([])))
    ]).pipe(
      switchMap(([apiIds, localChars]) => {
        const ids = apiIds || [];

        const apiRequests = ids.map((id) =>
          this.http.get<CharacterDetail>(`${this.BASE}/characters/${id}`).pipe(
            map((detail) => this.buildCharacter(id, detail)),
            catchError(() => of(null))
          )
        );

        const locals = Array.isArray(localChars) ? localChars : (localChars ? [localChars] : []);
        const localBuilt: Character[] = locals.map((l) => ({
          id: l.id,
          name: l.name,
          element: this.normalizeElement(l.element),
          weapon: this.normalizeWeapon(l.weapon),
          rarity: (parseInt(l.rarity) as 4 | 5) || 4,
          nation: l.nation,
          affiliation: l.affiliation,
          description: l.description,
          iconUrl: l.iconUrl || `${this.BASE}/characters/${l.id}/icon`,
          portraitUrl: l.portraitUrl || `${this.BASE}/characters/${l.id}/portrait`,
        }));

        const apiAll$ = apiRequests.length ? forkJoin(apiRequests) : of([] as any[]);

        return apiAll$.pipe(
          map((apiResults) => {
            const apiChars = (apiResults || []).filter((c: any) => c) as Character[];
            const apiIdSet = new Set(apiChars.map((c) => c.id));
            const uniques = localBuilt.filter((c) => !apiIdSet.has(c.id));
            return [...apiChars, ...uniques];
          })
        );
      }),
      tap((chars) => {
        this.cache = chars;
        this.cacheLoaded = true;
      }),
      catchError(() => of([] as Character[]))
    );
  }

  getCharacter(id: string): Observable<Character> {
    if (!id || id.trim() === '') {
      return throwError(() => new Error('Invalid character ID'));
    }

    return this.http.get<CharacterDetail>(`${this.BASE}/characters/${id}`).pipe(
      map((detail) => this.buildCharacter(id, detail)),
      catchError(() => {
        return this.http.get<any[]>('assets/characters.json').pipe(
          map((locals) => {
            const arr = Array.isArray(locals) ? locals : (locals ? [locals] : []);
            const l = arr.find((c: any) => c?.id === id);
            if (!l) throw new Error('Character not found');
            return {
              id: l.id || id,
              name: l.name || 'Unknown',
              element: this.normalizeElement(l.element),
              weapon: this.normalizeWeapon(l.weapon),
              rarity: (parseInt(l.rarity) as 4 | 5) || 4,
              nation: l.nation,
              affiliation: l.affiliation,
              description: l.description,
              iconUrl: l.iconUrl || `${this.BASE}/characters/${l.id || id}/icon`,
              portraitUrl: l.portraitUrl || `${this.BASE}/characters/${l.id || id}/portrait`,
            } as Character;
          }),
          catchError(() => {
            throw new Error('Character not found in API or local storage');
          })
        );
      })
    );
  }

  getCharacterDetail(id: string): Observable<any> {
    if (!id || id.trim() === '') {
      return of(null);
    }

    return this.http.get<any>(`${this.BASE}/characters/${id}`).pipe(
      catchError(() =>
        this.http.get<any[]>('assets/characters.json').pipe(
          map((locals) => {
            const arr = Array.isArray(locals) ? locals : (locals ? [locals] : []);
            const l = arr.find((c: any) => c?.id === id);
            if (!l) return null;
            return l;
          }),
          catchError(() => of(null))
        )
      )
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
