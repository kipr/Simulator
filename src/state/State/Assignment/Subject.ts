import LocalizedString from '../../../util/LocalizedString';

import tr from '@i18n';

enum Subject {
  Science,
  Technology,
  Engineering,
  Arts,
  Mathematics,
}

namespace Subject {
  export const toString = (subject: Subject): LocalizedString => {
    switch (subject) {
      case Subject.Science: return tr('Science');
      case Subject.Technology: return tr('Technology');
      case Subject.Engineering: return tr('Engineering');
      case Subject.Arts: return tr('Arts');
      case Subject.Mathematics: return tr('Mathematics');
    }
  };
}

export default Subject;