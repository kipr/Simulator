import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps, GREEN } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import { FontAwesome } from '../FontAwesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { MatPlacementSelection } from '../../util/jbcMatPlayArea';
import { WorldSceneItem } from '../../util/jbcChallengeCatalog';
import { ConditionGoalInput } from '../../util/customChallengePredicates';
import {
  buildItemSuccessWizardSteps,
  conditionGoalsForItemOutcome,
  ItemSuccessOutcomeId,
  ItemSuccessWizardStep,
} from '../../util/jbcChallengeSuggestions';

const SectionTitle = styled('h4', (props: ThemeProps) => ({
  margin: `${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px ${props.theme.itemPadding}px`,
  fontSize: '0.95em',
}));

const ProgressBar = styled('div', (props: ThemeProps) => ({
  margin: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px`,
  height: '6px',
  borderRadius: '3px',
  backgroundColor: 'rgba(255,255,255,0.1)',
  overflow: 'hidden',
}));

const ProgressFill = styled('div', {
  height: '100%',
  backgroundColor: GREEN.standard,
  transition: 'width 0.2s ease',
});

const StepMeta = styled('div', (props: ThemeProps) => ({
  margin: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding}px`,
  fontSize: '0.88em',
  opacity: 0.85,
}));

const ItemCard = styled('div', (props: ThemeProps) => ({
  margin: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  borderRadius: '6px',
  border: `2px solid ${GREEN.standard}`,
  backgroundColor: 'rgba(76, 175, 80, 0.08)',
}));

const ItemName = styled('div', {
  fontWeight: 700,
  fontSize: '1.15em',
  marginBottom: '4px',
});

const Question = styled('p', (props: ThemeProps) => ({
  margin: `${props.theme.itemPadding}px ${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px`,
  fontSize: '1em',
  lineHeight: 1.45,
}));

const OutcomeList = styled('div', (props: ThemeProps) => ({
  margin: `0 ${props.theme.itemPadding * 2}px`,
  display: 'flex',
  flexDirection: 'column',
  gap: `${props.theme.itemPadding}px`,
}));

const OutcomeCard = styled('label', (props: ThemeProps & { $selected?: boolean }) => ({
  display: 'block',
  padding: `${props.theme.itemPadding * 1.5}px`,
  borderRadius: '4px',
  border: `2px solid ${props.$selected ? GREEN.standard : props.theme.borderColor}`,
  backgroundColor: props.$selected ? 'rgba(76, 175, 80, 0.12)' : 'rgba(255,255,255,0.03)',
  cursor: 'pointer',
}));

const OutcomeTitle = styled('div', {
  fontWeight: 600,
  marginBottom: '4px',
});

const ScriptTip = styled('pre', (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding}px`,
  fontSize: '0.76em',
  lineHeight: 1.35,
  borderRadius: '4px',
  backgroundColor: 'rgba(0,0,0,0.35)',
  border: `1px solid ${props.theme.borderColor}`,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));

const ItemNav = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: `${props.theme.itemPadding}px`,
  margin: `${props.theme.itemPadding * 2}px`,
  paddingTop: `${props.theme.itemPadding}px`,
  borderTop: `1px solid ${props.theme.borderColor}`,
}));

const NavBtn = styled('button', (props: ThemeProps & { $primary?: boolean }) => ({
  padding: '8px 14px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600,
  color: props.theme.color,
  backgroundColor: props.$primary ? GREEN.standard : 'rgba(255,255,255,0.1)',
  ':disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
}));

const ReviewCard = styled('div', (props: ThemeProps) => ({
  margin: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding * 1.5}px`,
  borderRadius: '4px',
  border: `1px solid ${props.theme.borderColor}`,
  fontSize: '0.9em',
  lineHeight: 1.4,
}));

const EmptyHint = styled('p', (props: ThemeProps) => ({
  margin: `${props.theme.itemPadding * 2}px`,
  opacity: 0.88,
  lineHeight: 1.45,
}));

export interface ItemSuccessWizardProps extends ThemeProps {
  locale: LocalizedString.Language;
  placement: MatPlacementSelection;
  worldItems: WorldSceneItem[];
  onApplySuccessGoals: (goals: ConditionGoalInput[], step: ItemSuccessWizardStep) => void;
  itemSuccessChoices?: Record<string, ItemSuccessOutcomeId>;
  onItemSuccessChoicesChange?: (choices: Record<string, ItemSuccessOutcomeId>) => void;
  onWizardCompleteChange?: (complete: boolean) => void;
}

const ItemSuccessWizard: React.FC<ItemSuccessWizardProps> = ({
  theme,
  locale,
  placement,
  worldItems,
  onApplySuccessGoals,
  itemSuccessChoices: controlledChoices,
  onItemSuccessChoicesChange,
  onWizardCompleteChange,
}) => {
  const stepsKey = React.useMemo(
    () =>
      `${placement.worldItemKeys.slice().sort()
        .join(',')}|${placement.geometryKeys.slice().sort()
        .join(',')}`,
    [placement.worldItemKeys, placement.geometryKeys]
  );

  const steps = React.useMemo(
    () =>
      buildItemSuccessWizardSteps(
        placement.worldItemKeys,
        placement.geometryKeys,
        worldItems
      ),
    [stepsKey, placement.worldItemKeys, placement.geometryKeys, worldItems]
  );

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [internalChoices, setInternalChoices] = React.useState<
  Record<string, ItemSuccessOutcomeId>
  >({});
  const choices = controlledChoices ?? internalChoices;
  const setChoices_ = (updater: React.SetStateAction<Record<string, ItemSuccessOutcomeId>>) => {
    const next =
      typeof updater === 'function' ? updater(choices) : updater;
    if (onItemSuccessChoicesChange) {
      onItemSuccessChoicesChange(next);
    } else {
      setInternalChoices(next);
    }
  };
  const [showReview, setShowReview] = React.useState(false);
  const lastStepsKeyRef = React.useRef(stepsKey);

  React.useEffect(() => {
    const placementChanged = lastStepsKeyRef.current !== stepsKey;
    lastStepsKeyRef.current = stepsKey;

    if (placementChanged) {
      setCurrentIndex(0);
      const prior = controlledChoices ?? internalChoices;
      if (Object.keys(prior).length === 0) {
        setChoices_({});
      }
      setShowReview(false);
    } else {
      setCurrentIndex(i => {
        if (steps.length === 0) return 0;
        return Math.min(i, steps.length - 1);
      });
    }

    if (steps.length === 0) {
      setShowReview(true);
      return;
    }

    const prior = controlledChoices ?? internalChoices;
    const allChosen = steps.every(step => prior[step.id] !== undefined);
    if (allChosen) {
      setShowReview(true);
    }
  }, [stepsKey, steps.length]);

  React.useEffect(() => {
    onWizardCompleteChange?.(showReview || steps.length === 0);
  }, [showReview, steps.length, onWizardCompleteChange]);

  const safeIndex =
    steps.length === 0 ? 0 : Math.min(Math.max(0, currentIndex), steps.length - 1);
  const currentStep: ItemSuccessWizardStep | undefined = steps[safeIndex];
  const selectedOutcome = currentStep ? choices[currentStep.id] : undefined;

  const applyOutcome_ = (step: ItemSuccessWizardStep, outcomeId: ItemSuccessOutcomeId) => {
    if (outcomeId === 'skip' || outcomeId === 'custom_script') {
      onApplySuccessGoals([], step);
      return;
    }
    const goals = conditionGoalsForItemOutcome(step, outcomeId);
    if (goals.length > 0) {
      onApplySuccessGoals(goals, step);
    }
  };

  const goNext_ = () => {
    if (!currentStep || !selectedOutcome) return;
    applyOutcome_(currentStep, selectedOutcome);
    const atLast = safeIndex >= steps.length - 1;
    if (atLast) {
      setShowReview(true);
      return;
    }
    setCurrentIndex(safeIndex + 1);
  };

  const goPrev_ = () => {
    if (showReview) {
      setShowReview(false);
      setCurrentIndex(Math.max(0, steps.length - 1));
      return;
    }
    setCurrentIndex(i => Math.max(0, i - 1));
  };

  const outcomeLabel_ = (stepId: string): string => {
    const step = steps.find(s => s.id === stepId);
    const outcomeId = choices[stepId];
    if (!step || !outcomeId) return '—';
    return step.outcomes.find(o => o.id === outcomeId)?.title ?? outcomeId;
  };

  if (steps.length === 0) {
    return (
      <EmptyHint theme={theme}>
        {LocalizedString.lookup(
          tr('No items on the mat yet. Add objects on the previous step, or set goals below.'),
          locale
        )}
      </EmptyHint>
    );
  }

  if (showReview) {
    return (
      <>
        <SectionTitle theme={theme}>
          {LocalizedString.lookup(tr('Item goals summary'), locale)}
        </SectionTitle>
        {steps.map((step, index) => (
          <ReviewCard key={step.id} theme={theme}>
            <strong>{step.displayName}</strong>
            {step.zoneName ? ` (${step.zoneName})` : ''} — {outcomeLabel_(step.id)}
            <NavBtn
              theme={theme}
              type="button"
              style={{ marginTop: theme.itemPadding, display: 'inline-block' }}
              onClick={() => {
                setShowReview(false);
                setCurrentIndex(index);
              }}
            >
              {LocalizedString.lookup(tr('Change'), locale)}
            </NavBtn>
          </ReviewCard>
        ))}
        <ItemNav theme={theme}>
          <NavBtn theme={theme} type="button" onClick={goPrev_}>
            <FontAwesome icon={faChevronLeft} />{' '}
            {LocalizedString.lookup(tr('Edit last item'), locale)}
          </NavBtn>
        </ItemNav>
      </>
    );
  }

  if (!currentStep) {
    return null;
  }

  const progress = ((safeIndex + 1) / steps.length) * 100;

  return (
    <>
      <SectionTitle theme={theme}>
        {LocalizedString.lookup(tr('Item goals'), locale)} ({safeIndex + 1} / {steps.length})
      </SectionTitle>
      <ProgressBar theme={theme}>
        <ProgressFill style={{ width: `${progress}%` }} />
      </ProgressBar>
      {currentStep.zoneName && (
        <StepMeta theme={theme}>
          {LocalizedString.lookup(tr('Area'), locale)}: {currentStep.zoneName}
        </StepMeta>
      )}
      <ItemCard theme={theme}>
        <ItemName>{currentStep.displayName}</ItemName>
      </ItemCard>
      <Question theme={theme}>
        {LocalizedString.lookup(tr('How should this count toward success?'), locale)}
      </Question>
      <OutcomeList theme={theme}>
        {currentStep.outcomes.map(option => (
          <OutcomeCard
            key={option.id}
            theme={theme}
            $selected={selectedOutcome === option.id}
          >
            <div style={{ display: 'flex', flexDirection: 'row', gap: theme.itemPadding }}>
              <input
                type="radio"
                name={`outcome-${currentStep.id}`}
                checked={selectedOutcome === option.id}
                onChange={() =>
                  setChoices_(prev => ({ ...prev, [currentStep.id]: option.id }))
                }
              />
              <div style={{ flex: 1 }}>
                <OutcomeTitle>{option.title}</OutcomeTitle>
                <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.4 }}>{option.description}</p>
                {selectedOutcome === option.id && option.scriptTip && (
                  <ScriptTip theme={theme}>{option.scriptTip}</ScriptTip>
                )}
              </div>
            </div>
          </OutcomeCard>
        ))}
      </OutcomeList>
      <ItemNav theme={theme}>
        <NavBtn theme={theme} type="button" disabled={currentIndex === 0} onClick={goPrev_}>
          <FontAwesome icon={faChevronLeft} /> {LocalizedString.lookup(tr('Previous'), locale)}
        </NavBtn>
        <div style={{ flex: 1 }} />
        <NavBtn
          theme={theme}
          type="button"
          $primary
          disabled={!selectedOutcome}
          onClick={goNext_}
        >
          {safeIndex >= steps.length - 1
            ? LocalizedString.lookup(tr('Summary'), locale)
            : LocalizedString.lookup(tr('Next'), locale)}{' '}
          <FontAwesome icon={faChevronRight} />
        </NavBtn>
      </ItemNav>
    </>
  );
};

export default ItemSuccessWizard;
