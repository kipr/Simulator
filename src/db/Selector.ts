import { CHALLENGE_COLLECTION, CHALLENGE_COMPLETION_COLLECTION, SCENE_COLLECTION } from './constants';

interface Selector {
  collection: string;
  id: string;
}

namespace Selector {
  export const scene = (id: string): Selector => ({
    collection: SCENE_COLLECTION,
    id,
  });

  export const challenge = (id: string): Selector => ({
    collection: CHALLENGE_COLLECTION,
    id,
  });

  export const challengeCompletion = (userId: string, id: string): Selector => ({
    collection: `${userId}/${CHALLENGE_COMPLETION_COLLECTION}`,
    id,
  });
}

export default Selector;