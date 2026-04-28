import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CharacterService } from '../../services/character.service';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss'],
})
export class CharacterListComponent implements OnInit {
  characters: Character[] = [];
  currentPage = 1;
  totalPages = 0;
  totalCount = 0;
  loading = false;
  initialLoad = true; // ilk yüklemede tüm detayları çekiyor, farklı mesaj
  error = '';
  searchQuery = '';
  isSearchMode = false;

  constructor(private characterService: CharacterService, private router: Router) {}

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.error = '';
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const obs = this.isSearchMode && this.searchQuery
      ? this.characterService.search(this.searchQuery, page)
      : this.characterService.getPage(page);

    obs.subscribe({
      next: ({ characters, total }) => {
        this.characters = characters;
        this.totalCount = total;
        this.totalPages = Math.ceil(total / this.characterService.PAGE_SIZE);
        this.loading = false;
        this.initialLoad = false;
      },
      error: () => {
        this.error = 'Karakterler yüklenirken hata oluştu.';
        this.loading = false;
        this.initialLoad = false;
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.isSearchMode = query.length > 0;
    this.loadPage(1);
  }

  onPageChange(page: number): void {
    this.loadPage(page);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.characterService.PAGE_SIZE + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.characterService.PAGE_SIZE, this.totalCount);
  }

  goTo(id: string) {
    this.router.navigate(['/character', id]);
  }
}
