import { Component, Input } from '@angular/core';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-character-card',
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss'],
})
export class CharacterCardComponent {
  @Input() character!: Character;

  get stars(): number[] {
    return Array(this.character.rarity).fill(0);
  }

  get elementLabel(): string {
    const map: Record<string, string> = {
      pyro: 'Pyro', hydro: 'Hydro', anemo: 'Anemo',
      electro: 'Electro', dendro: 'Dendro', cryo: 'Cryo', geo: 'Geo',
    };
    return map[this.character.element] || this.character.element;
  }

  get weaponLabel(): string {
    const map: Record<string, string> = {
      sword: 'Sword', claymore: 'Claymore', polearm: 'Polearm',
      bow: 'Bow', catalyst: 'Catalyst',
    };
    return map[this.character.weapon] || this.character.weapon;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'https://genshin.jmp.blue/characters/' + this.character.id + '/icon-big';
  }
}
