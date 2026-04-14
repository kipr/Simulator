import Dict from "util/objectOps/Dict";

export const CHALLENGE_LIST = {
  'jbc0': 'JBC Challenge 0',
  'jbc1': 'JBC Challenge 1',
  'jbc2': 'JBC Challenge 2',
  'jbc3': 'JBC Challenge 3',
  'jbc4': 'JBC Challenge 4',
  'jbc5': 'JBC Challenge 5',
  'jbc6': 'JBC Challenge 6',
  'jbc7': 'JBC Challenge 7',
  'jbc8': 'JBC Challenge 8',
  'jbc9': 'JBC Challenge 9',
  'jbc10': 'JBC Challenge 10',
  'jbc11': 'JBC Challenge 11',
  'jbc12': 'JBC Challenge 12',
  'jbc14': 'JBC Challenge 14',
  'jbc15': 'JBC Challenge 15',
  'jbc16': 'JBC Challenge 16',
  'jbc17': 'JBC Challenge 17',
  'jbc18': 'JBC Challenge 18',
  'jbc19': 'JBC Challenge 19',
  'jbc20': 'JBC Challenge 20',
  'jbc21': 'JBC Challenge 21',
  'jbc22': 'JBC Challenge 22',
  'jbc23': 'JBC Challenge 23',
  'jbc24': 'JBC Challenge 24',
} as const;


export type ChallengeName = keyof typeof CHALLENGE_LIST;