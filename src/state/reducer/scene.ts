import defaultItems from "../../items/defaultItems";
import { Item, Scene } from "../State";

export namespace SceneAction {


  export interface AddItem {
    type: 'add-item';
    id: string;
    item: Item;
  }

  export type AddItemParams = Omit<AddItem, 'type'>;

  export const addItem = (params: AddItemParams): AddItem => ({
    type: 'add-item',
    ...params
  });

  export interface RemoveItem {
    type: 'remove-item';
    id: string;
  }

  export type RemoveItemParams = Omit<RemoveItem, 'type'>;

  export const removeItem = (params: RemoveItemParams): RemoveItem => ({
    type: 'remove-item',
    ...params
  });

  export interface SetItem {
    type: 'set-item';
    id: string;
    item: Item;
  }

  export type SetItemParams = Omit<SetItem, 'type'>;

  export const setItem = (params: SetItemParams): SetItem => ({
    type: 'set-item',
    ...params
  });

  export interface SetItemBatch {
    type: 'set-item-batch';
    items: { [id: string]: Item };
  }

  export type SetItemBatchParams = Omit<SetItemBatch, 'type'>;

  export const setItemBatch = (params: SetItemBatchParams): SetItemBatch => ({
    type: 'set-item-batch',
    ...params
  });

  export interface SelectItem {
    type: 'select-item';
    id?: string;
  }

  export type SelectItemParams = Omit<SelectItem, 'type'>;

  export const selectItem = (params: SelectItemParams): SelectItem => ({
    type: 'select-item',
    ...params
  });

  export interface UnselectAll {
    type: 'unselect-all';
  }

  export const UNSELECT_ALL: UnselectAll = { type: 'unselect-all' };
}

export type SceneAction = (
  SceneAction.AddItem |
  SceneAction.RemoveItem |
  SceneAction.SetItem |
  SceneAction.SetItemBatch |
  SceneAction.SelectItem |
  SceneAction.UnselectAll
);

export const DEFAULT_SCENE: Scene = {
  itemOrdering: Object.keys(defaultItems),
  items: {
    ...defaultItems
  },
  selectedItem: undefined
};

export const reduceScene = (state: Scene = DEFAULT_SCENE, action: SceneAction) => {
  switch (action.type) {
    case 'add-item':
      return {
        ...state,
        items: {
          ...state.items,
          [action.id]: action.item,
        },
        itemOrdering: [...state.itemOrdering, action.id],
      };
    case 'remove-item': {
      const nextState = {
        ...state,
        items: {
          ...state.items,
        },
        itemOrdering: state.itemOrdering.filter(id => id !== action.id),
      };

      delete nextState.items[action.id];
      return nextState;
    }
    case 'set-item':
      return {
        ...state,
        items: {
          ...state.items,
          [action.id]: action.item,
        },
      };
    case 'set-item-batch':
      return {
        ...state,
        items: {
          ...state.items,
          ...action.items,
        },
      };
    case 'select-item':
      return {
        ...state,
        selectedItem: action.id,
      };
    case 'unselect-all':
      return {
        ...state,
        selectedItem: undefined,
      };
    default:
      return state;
  }
};