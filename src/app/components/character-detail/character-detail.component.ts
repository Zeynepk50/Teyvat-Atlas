import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-character-detail',
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.scss']
})
export class CharacterDetailComponent {
  @Input() character!: Character;
  @Output() close = new EventEmitter<void>();

  get stars(): number[] { return Array(this.character.rarity).fill(0); }
  get elementLabel(): string {
    const map: Record<string,string> = { pyro:'Pyro', hydro:'Hydro', anemo:'Anemo', electro:'Electro', dendro:'Dendro', cryo:'Cryo', geo:'Geo' };
    return map[this.character.element] || this.character.element;
  }
  get weaponLabel(): string {
    const map: Record<string,string> = { sword:'Sword', claymore:'Claymore', polearm:'Polearm', bow:'Bow', catalyst:'Catalyst' };
    return map[this.character.weapon] || this.character.weapon;
  }
}