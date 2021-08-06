import Item from './Item';



export interface Scene {
  itemOrdering: string[];
  items: {
    [name: string]: Item;
  };
  selectedItem: string;
}

export interface State {
  scene: Scene;
}