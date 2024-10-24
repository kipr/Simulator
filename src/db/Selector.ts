import {
  USER_COLLECTION,
  SCENE_COLLECTION,
  CHALLENGE_COLLECTION,
  CHALLENGE_COMPLETION_COLLECTION,
  USER_COLLECTION,
  ASSIGNMENT_COLLECTION,
} from './constants';

interface Selector {
  collection: string;
  id: string;
}

namespace Selector {
  export const user = (id: string): Selector => ({
    collection: USER_COLLECTION,
    id,
  });
  
  export const scene = (id: string): Selector => ({
    collection: SCENE_COLLECTION,
    id,
  });

  export const challenge = (id: string): Selector => ({
    collection: CHALLENGE_COLLECTION,
    id,
  });

  export const challengeCompletion = (id: string): Selector => ({
    collection: CHALLENGE_COMPLETION_COLLECTION,
    id,
  });

  export const user = (id: string): Selector => ({
    collection: USER_COLLECTION,
    id,
  });

  export const assignment = (id: string): Selector => ({
    collection: ASSIGNMENT_COLLECTION,
    id,
  });
}

export default Selector;