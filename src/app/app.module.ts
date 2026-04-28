import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { CharacterListComponent } from './components/character-list/character-list.component';
import { CharacterCardComponent } from './components/character-card/character-card.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CharacterDetailComponent } from './components/character-detail/character-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    CharacterListComponent,
    CharacterCardComponent,
    PaginationComponent,
    SearchBarComponent,
    CharacterDetailComponent,
  ],
  imports: [BrowserModule, HttpClientModule, CommonModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
