import { Item } from '../state';

interface ItemObject {
  readonly item: Item;
  place(): void;
}

namespace ItemObject {
  export interface Config<T extends Item> {
    item: T;
  }

  export interface Constructor<T extends Item> {
    new(config: Config<T>): ItemObject;
  }
}

export default ItemObject;