import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { Character } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-character-page',
  templateUrl: './character-page.component.html',
  styleUrls: ['./character-page.component.scss']
})
export class CharacterPageComponent implements OnInit, OnDestroy {
  character?: Character;
  rawDetail?: any;
  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private characterService: CharacterService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((p) => {
      const id = p.get('id');
      if (!id || typeof id !== 'string' || id.trim() === '') {
        this.router.navigate(['/']);
        return;
      }
      this.load(id.trim());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(id: string) {
    if (!id || id.trim() === '') {
      this.error = 'Geçersiz karakter ID.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    forkJoin([
      this.characterService.getCharacter(id).pipe(catchError(() => of(null))),
      this.characterService.getCharacterDetail(id).pipe(catchError(() => of(null)))
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results: any) => {
          const [c, detail] = results;
          if (!c) {
            this.error = 'Karakter bulunamadı.';
            this.loading = false;
            return;
          }
          this.character = c;
          this.rawDetail = detail || undefined;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Karakter yükleme hatası:', err);
          this.error = 'Karakter bulunamadı.';
          this.loading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getDetailKeys(): string[] {
    if (!this.rawDetail || typeof this.rawDetail !== 'object') return [];
    try {
      const excluded = new Set(['name', 'element', 'weapon', 'weapontype', 'rarity', 'nation', 'constellation', 'affiliation', 'description', 'title', 'id', 'iconUrl', 'icon', 'portraitUrl', 'portrait']);
      return Object.keys(this.rawDetail)
        .filter(k => !excluded.has(k) && this.rawDetail[k] != null)
        .slice(0, 8);
    } catch (e) {
      console.error('Detail keys hatası:', e);
      return [];
    }
  }

  formatKey(key: string): string {
    try {
      if (!key || typeof key !== 'string') return 'Bilinmiyor';
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .trim()
        .split(' ')
        .filter(w => w.length > 0)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    } catch (e) {
      return key || 'Bilinmiyor';
    }
  }
}
