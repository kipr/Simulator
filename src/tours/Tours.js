const DEFAULT = {
  completed: false,
  step: 0,
  dismissed: false,
  version: 1,
};

const IDS = {
  DASHBOARD: 'dashboard-tour',
  CLASSROOM: 'classroom-tour',
  LIMITED_CHALLENGE: 'limited-challenge-tour',
};

const ALL = [IDS.DASHBOARD, IDS.CLASSROOM, IDS.LIMITED_CHALLENGE];

function withDefaults(doc = {}) {
  return { ...DEFAULT, ...doc };
}

export default { DEFAULT, IDS, ALL, withDefaults };
