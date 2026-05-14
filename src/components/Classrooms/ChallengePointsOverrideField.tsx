import * as React from 'react';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import { ThemeProps } from '../constants/theme';
import Input from '../interface/Input';
import { Classroom, ClassroomAssignment } from '../../state/State/Classroom';
import {
  defaultChallengePoints,
  getChallengePointsOverride,
  getEffectiveChallengePoints,
} from '../../util/classroomGradeOverrides';

export function ChallengePointsOverrideField({
  theme,
  locale,
  studentId,
  assignment,
  sceneId,
  defaultPoints,
  classroom,
  onCommit,
}: {
  theme: ThemeProps['theme'];
  locale: LocalizedString.Language;
  studentId: string;
  assignment: ClassroomAssignment;
  sceneId: string;
  defaultPoints: number | '';
  classroom: Classroom;
  onCommit: (override: number | null) => void;
}) {
  const effective = getEffectiveChallengePoints(classroom, studentId, assignment, sceneId, defaultPoints);
  const defN = defaultChallengePoints(defaultPoints);
  const hasOverride = getChallengePointsOverride(classroom, studentId, assignment, sceneId) !== undefined;
  const [text, setText] = React.useState(String(effective));

  React.useEffect(() => {
    setText(String(effective));
  }, [effective, classroom.challengePointsOverrides, studentId, sceneId, assignment.docId, assignment.title]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: '4.5rem' }}>
      <Input
        type="number"
        min={0}
        theme={theme}
        style={{ width: '4.5rem', textAlign: 'center' }}
        value={text}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
        onBlur={() => {
          const raw = text.trim();
          const n = raw === '' ? defN : Math.max(0, Math.floor(Number(raw)));
          if (!Number.isFinite(n)) {
            setText(String(effective));
            return;
          }
          if (n === defN) onCommit(null);
          else onCommit(n);
          setText(String(n === defN ? defN : n));
        }}
      />
      {hasOverride && (
        <span style={{ fontSize: '0.65em', opacity: 0.8 }}>
          {LocalizedString.lookup(tr('Override'), locale)}
        </span>
      )}
    </div>
  );
}
