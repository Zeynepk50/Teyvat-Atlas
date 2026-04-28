export type Element =
  | 'pyro' | 'hydro' | 'anemo' | 'electro'
  | 'dendro' | 'cryo' | 'geo';

export type WeaponType =
  | 'sword' | 'claymore' | 'polearm' | 'bow' | 'catalyst';

export interface Character {
  id: string;
  name: string;
  element: Element;
  weapon: WeaponType;
  rarity: 4 | 5;
  nation?: string;
  affiliation?: string;
  description?: string;
  iconUrl: string;
  portraitUrl: string;
}

export interface CharacterDetail {
  name: string;
  element: string;
  weapontype: string;
  rarity: string;
  nation?: string;
  affiliation?: string;
  description?: string;
}
