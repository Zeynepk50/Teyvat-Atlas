import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CharacterService } from '../../services/character.service';
import { Character, Element } from '../../models/character.model';

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
  // isSearchMode property removed, replaced by getter
  selectedElements: Element[] = [];
  elements: Element[] = ['pyro', 'hydro', 'anemo', 'electro', 'dendro', 'cryo', 'geo'];

  constructor(private characterService: CharacterService, private router: Router) { }

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.error = '';
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const obs = this.characterService.getCharacters(page, this.searchQuery, this.selectedElements);

    obs.subscribe({
      next: ({ characters, total }: { characters: Character[]; total: number }) => {
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

  get isSearchMode(): boolean {
    return this.searchQuery.length > 0 || this.selectedElements.length > 0;
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.loadPage(1);
  }

  onElementSelect(element: Element): void {
    const index = this.selectedElements.indexOf(element);
    if (index > -1) {
      this.selectedElements = this.selectedElements.filter(e => e !== element);
    } else {
      this.selectedElements = [...this.selectedElements, element];
    }
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
