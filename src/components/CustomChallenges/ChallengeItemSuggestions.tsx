import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import {
  ChallengeSuggestion,
  PlayZoneSelectionSummary,
  successGoalsForSuggestionKeys,
} from '../../util/jbcChallengeSuggestions';
import { JbcCatalogSuccessGoal } from '../../util/jbcChallengeCatalog';

const Section = styled('div', (props: ThemeProps) => ({
  padding: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px`,
}));

const SectionTitle = styled('h4', (props: ThemeProps) => ({
  margin: `${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px ${props.theme.itemPadding}px`,
  fontSize: '0.95em',
}));

const SummaryCard = styled('div', (props: ThemeProps) => ({
  margin: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding * 1.5}px`,
  borderRadius: '4px',
  border: `1px solid ${props.theme.borderColor}`,
  backgroundColor: 'rgba(255,255,255,0.04)',
  fontSize: '0.9em',
  lineHeight: 1.45,
}));

const ZoneRow = styled('div', {
  marginTop: '8px',
});

const SuggestionCard = styled('div', (props: ThemeProps) => ({
  marginBottom: `${props.theme.itemPadding * 1.5}px`,
  padding: `${props.theme.itemPadding * 1.5}px`,
  borderRadius: '4px',
  border: `1px solid ${props.theme.borderColor}`,
  backgroundColor: 'rgba(255,255,255,0.03)',
}));

const SuggestionTitle = styled('div', {
  fontWeight: 600,
  marginBottom: '6px',
});

const ScriptTip = styled('pre', (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding}px`,
  fontSize: '0.78em',
  lineHeight: 1.35,
  overflowX: 'auto',
  borderRadius: '4px',
  backgroundColor: 'rgba(0,0,0,0.35)',
  border: `1px solid ${props.theme.borderColor}`,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));

const ActionButton = styled('button', (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding}px`,
  padding: '6px 10px',
  borderRadius: '4px',
  border: `1px solid ${props.theme.borderColor}`,
  backgroundColor: 'rgba(76, 175, 80, 0.2)',
  color: props.theme.color,
  cursor: 'pointer',
  fontSize: '0.85em',
  fontWeight: 600,
}));

export interface ChallengeItemSuggestionsProps extends ThemeProps {
  locale: LocalizedString.Language;
  summary: PlayZoneSelectionSummary;
  suggestions: ChallengeSuggestion[];
  onAddSuccessGoals?: (goals: JbcCatalogSuccessGoal[]) => void;
  showAddRules?: boolean;
}

const ChallengeItemSuggestions: React.FC<ChallengeItemSuggestionsProps> = ({
  theme,
  locale,
  summary,
  suggestions,
  onAddSuccessGoals,
  showAddRules = true,
}) => {
  const hasMatItems =
    summary.matItemLabels.length > 0 || summary.matGeometryLabels.length > 0;
  const hasZones = summary.zoneCount > 0;

  return (
    <>
      <SectionTitle theme={theme}>
        {LocalizedString.lookup(tr('What you placed'), locale)}
      </SectionTitle>
      <SummaryCard theme={theme}>
        {hasMatItems ? (
          <>
            {summary.matItemLabels.length > 0 && (
              <div>
                <strong>{LocalizedString.lookup(tr('Items on the mat'), locale)}</strong>:{' '}
                {summary.matItemLabels.join(', ')}
              </div>
            )}
            {summary.matGeometryLabels.length > 0 && (
              <div style={{ marginTop: summary.matItemLabels.length > 0 ? 8 : 0 }}>
                <strong>
                  {LocalizedString.lookup(tr('Script geometries'), locale)}
                </strong>
                : {summary.matGeometryLabels.join(', ')}
              </div>
            )}
          </>
        ) : (
          <span style={{ opacity: 0.85 }}>
            {LocalizedString.lookup(
              tr('No items on the mat yet. Go back to add World objects and script geometries.'),
              locale
            )}
          </span>
        )}
        {hasZones && (
          <div style={{ marginTop: hasMatItems ? 10 : 0, opacity: 0.9 }}>
            {LocalizedString.lookup(tr('Play areas'), locale)}:{' '}
            {summary.zones.map(z => z.name).join(', ')}
            {LocalizedString.lookup(
              tr(' (success rules for areas are set separately on the previous step)'),
              locale
            )}
          </div>
        )}
      </SummaryCard>

      <SectionTitle theme={theme}>
        {LocalizedString.lookup(tr('Ideas for your challenge'), locale)}
      </SectionTitle>
      <Section theme={theme}>
        {suggestions.map(suggestion => (
          <SuggestionCard key={suggestion.id} theme={theme}>
            <SuggestionTitle>{suggestion.title}</SuggestionTitle>
            <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.45 }}>{suggestion.description}</p>
            {suggestion.scriptTip && (
              <ScriptTip theme={theme}>{suggestion.scriptTip}</ScriptTip>
            )}
            {showAddRules &&
              onAddSuccessGoals &&
              suggestion.relatedSuccessGoalKeys &&
              suggestion.relatedSuccessGoalKeys.length > 0 && (
              <ActionButton
                theme={theme}
                type="button"
                onClick={() => {
                  onAddSuccessGoals(
                    successGoalsForSuggestionKeys(suggestion.relatedSuccessGoalKeys)
                  );
                }}
              >
                {LocalizedString.lookup(tr('Add matching JBC success rules'), locale)}
              </ActionButton>
            )}
          </SuggestionCard>
        ))}
      </Section>
    </>
  );
};

export default ChallengeItemSuggestions;
