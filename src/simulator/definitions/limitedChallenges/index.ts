import { LimitedChallenges } from '../../../state/State';
import { LimitedChallengeBrief } from '../../../state/State/LimitedChallenge';
import Async from '../../../state/State/Async';

import speedRunRingAroundTheCan from './speed-run-ring-around-the-can';

/**
 * Pre-built limited challenges ready for use in the reducer's default state.
 * Add new limited challenges here by importing them and adding an entry to this object.
 */
export const DEFAULT_LIMITED_CHALLENGES: LimitedChallenges = {
  'limited-speed-run-1': Async.loaded({
    value: speedRunRingAroundTheCan,
    brief: LimitedChallengeBrief.fromChallenge(speedRunRingAroundTheCan),
  }),
};
