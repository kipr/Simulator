// import * as Babylon from 'babylonjs';
// // import Item from './Item';
// import { Item } from '.';
// import ItemObject from './ItemObject';
// import { Can } from './Can';
// import Dict from '../Dict';
// import { default as Items } from './defaultItems';

export { default as Item } from './Item';
export { default as ItemObject } from './Item';
export * from './Can';
export * from './PaperReam';
export { default as Items } from './defaultItems';

// const defaultItemList = Dict.toList(Items);

// export function instantiate(scene: Babylon.Scene, customItem?: Item, id?: string): ItemObject {
//   let item: Item;
//   if (id !== undefined) {
//     const key = Object.keys(Items).indexOf(id);
//     if (key !== undefined) {
//       item = defaultItemList[key][1];
//       switch (item.type) {
//         case Item.Type.Can:
//           return new Can({ scene, item });
//         case Item.Type.PaperReam:
//           throw new Error('Working on reams still');
//       }
//     } else {
//       throw new Error('Could not find by id');
//     }
//   } else if (customItem !== undefined) {
//     item = customItem;
//   } else {
//     throw new Error('No Item or id was used');
//   }
// }

// // export const instantiate = (scene: Babylon.Scene, item: Item): any => {

// // };