import { LimitedChallenges } from '../../../state/State';
import { LimitedChallengeBrief } from '../../../state/State/LimitedChallenge';
import Async from '../../../state/State/Async';

import speedRunRingAroundTheCan from './speed-run-ring-around-the-can';
import speedRunTagYoureIt from './speed-run-tag-youre-it';
import speedRunDriveStraight from './speed-run-drive-straight';

/**
 * Pre-built limited challenges ready for use in the reducer's default state.
 * Add new limited challenges here by importing them and adding an entry to this object.
 */
export const DEFAULT_LIMITED_CHALLENGES: LimitedChallenges = {
  'limited-speed-run-3': Async.loaded({
    value: speedRunDriveStraight,
    brief: LimitedChallengeBrief.fromChallenge(speedRunDriveStraight),
  }),
  'limited-speed-run-1': Async.loaded({
    value: speedRunRingAroundTheCan,
    brief: LimitedChallengeBrief.fromChallenge(speedRunRingAroundTheCan),
  }),
  'limited-speed-run-2': Async.loaded({
    value: speedRunTagYoureIt,
    brief: LimitedChallengeBrief.fromChallenge(speedRunTagYoureIt),
  }),
};
