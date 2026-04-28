import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnDestroy {
  @Output() searchChange = new EventEmitter<string>();

  query = '';
  private input$ = new Subject<string>();
  private sub = this.input$
    .pipe(debounceTime(350), distinctUntilChanged())
    .subscribe((q) => this.searchChange.emit(q));

  onInput(value: string): void {
    this.query = value;
    this.input$.next(value);
  }

  clear(): void {
    this.query = '';
    this.input$.next('');
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
