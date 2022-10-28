import { SCENE_COLLECTION } from './constants';

interface Selector {
  collection: string;
  id: string;
}

namespace Selector {
  export const scene = (id: string): Selector => ({
    collection: SCENE_COLLECTION,
    id,
  });
}

export default Selector;