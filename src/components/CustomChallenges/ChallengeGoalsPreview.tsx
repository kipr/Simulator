import * as React from 'react';
import { styled } from 'styletron-react';
import tr from '@i18n';
import { ThemeProps } from '../constants/theme';
import Section from '../interface/Section';
import GoalList from '../Challenge/GoalList';
import LocalizedString from '../../util/LocalizedString';
import { Goal } from '../../state/State/Challenge';

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  marginBottom: `${props.theme.itemPadding}px`,
}));

const EmptyHint = styled('p', (props: ThemeProps) => ({
  margin: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px`,
  opacity: 0.85,
  fontSize: '0.88em',
  lineHeight: 1.45,
}));

export interface ChallengeGoalsPreviewProps extends ThemeProps {
  locale: LocalizedString.Language;
  successGoals: Goal[];
  failureGoals: Goal[];
}

/** Same Success / Failure layout as the Challenge tab when starting a challenge. */
const ChallengeGoalsPreview: React.FC<ChallengeGoalsPreviewProps> = ({
  theme,
  locale,
  successGoals,
  failureGoals,
}) => {
  const hasSuccess = successGoals.length > 0;
  const hasFailure = failureGoals.length > 0;

  if (!hasSuccess && !hasFailure) {
    return (
      <EmptyHint theme={theme}>
        {LocalizedString.lookup(
          tr('No goals yet. Go back to add success rules.'),
          locale
        )}
      </EmptyHint>
    );
  }

  return (
    <Container theme={theme}>
      {hasSuccess && (
        <Section name={LocalizedString.lookup(tr('Success'), locale)} theme={theme}>
          <GoalList goals={successGoals} locale={locale} type="success" />
        </Section>
      )}
      {hasFailure && (
        <Section name={LocalizedString.lookup(tr('Failure'), locale)} theme={theme}>
          <GoalList goals={failureGoals} locale={locale} type="failure" />
        </Section>
      )}
    </Container>
  );
};

export default ChallengeGoalsPreview;
