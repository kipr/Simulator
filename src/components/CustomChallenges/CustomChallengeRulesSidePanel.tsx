import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import Dict from '../../util/objectOps/Dict';
import Event from '../../state/State/Challenge/Event';
import {
  buildFailureGoals,
  buildSuccessGoals,
  ConditionGoalInput,
  mergeConditionGoals,
} from '../../util/customChallengePredicates';
import {
  JBC_CATALOG_SUCCESS_GOALS,
  JbcCatalogSuccessGoal,
  WorldSceneItem,
} from '../../util/jbcChallengeCatalog';
import {
  conditionGoalsFromItemWizardChoices,
  ItemSuccessOutcomeId,
  ItemSuccessWizardStep,
  itemSuccessChoiceSummaries,
} from '../../util/jbcChallengeSuggestions';
import { friendlyFailureGoals } from '../../util/customChallengeGoals';
import {
  MatPlacementSelection,
  MatPlayZone,
} from '../../util/jbcMatPlayArea';
import {
  allZoneSuccessGoals,
  conditionGoalsFromPlayAreaZone,
} from '../../util/playAreaSuccessGoals';
import ChallengeGoalsPreview from './ChallengeGoalsPreview';
import MatItemRulesSummary from './MatItemRulesSummary';
import CustomChallengeWizardSidePanel from './CustomChallengeWizardSidePanel';
import { TourRegistry } from '../../tours/TourRegistry';
import ItemSuccessWizard from './ItemSuccessWizard';
import JbcCatalogSuccessGoalPicker from './JbcCatalogSuccessGoalPicker';
import ConditionGoalsEditor from './ConditionGoalsEditor';

const SectionTitle = styled('h4', (props: ThemeProps) => ({
  margin: `${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px ${props.theme.itemPadding}px`,
  fontSize: '0.95em',
}));

const DetailsSection = styled('details', (props: ThemeProps) => ({
  margin: `${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding}px 0`,
  borderTop: `1px solid ${props.theme.borderColor}`,
}));

const Hint = styled('div', (props: ThemeProps) => ({
  margin: `0 ${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 2}px`,
  opacity: 0.85,
  fontSize: '0.88em',
  lineHeight: 1.45,
}));

export type CustomChallengeRulesStep = 'success' | 'failure' | 'review';

export interface CustomChallengeRulesSidePanelProps extends ThemeProps {
  locale: LocalizedString.Language;
  step: CustomChallengeRulesStep;
  stepLabel: string;
  playZones: MatPlayZone[];
  placement: MatPlacementSelection;
  worldItems: WorldSceneItem[];
  events: Dict<Event>;
  successGoals: ConditionGoalInput[];
  failureGoals: ConditionGoalInput[];
  itemSuccessChoices: Record<string, ItemSuccessOutcomeId>;
  onItemSuccessChoicesChange: (choices: Record<string, ItemSuccessOutcomeId>) => void;
  selectedCatalogSuccessKeys: ReadonlySet<string>;
  disabledCatalogSuccessKeys: ReadonlySet<string>;
  onCatalogSuccessGoalToggle: (entry: JbcCatalogSuccessGoal, selected: boolean) => void;
  onAddCatalogSuccessGoals: (entries: JbcCatalogSuccessGoal[]) => void;
  onAddConditionSuccessGoals: (
    goals: ConditionGoalInput[],
    step?: ItemSuccessWizardStep
  ) => void;
  onSuccessGoalsChange: (goals: ConditionGoalInput[]) => void;
  onFailureGoalsChange: (goals: ConditionGoalInput[]) => void;
  onBack: () => void;
  onContinue: () => void;
  onCancel: () => void;
  continueLabel?: Parameters<typeof LocalizedString.lookup>[0];
  isFinishStep?: boolean;
  tourRegistry?: TourRegistry;
  tourTargetKey?: string;
}

const CustomChallengeRulesSidePanel: React.FC<CustomChallengeRulesSidePanelProps> = ({
  theme,
  locale,
  step,
  stepLabel,
  playZones,
  placement,
  worldItems,
  events,
  successGoals,
  failureGoals,
  itemSuccessChoices,
  onItemSuccessChoicesChange,
  selectedCatalogSuccessKeys,
  disabledCatalogSuccessKeys,
  onCatalogSuccessGoalToggle,
  onAddCatalogSuccessGoals,
  onAddConditionSuccessGoals,
  onSuccessGoalsChange,
  onFailureGoalsChange,
  onBack,
  onContinue,
  onCancel,
  continueLabel,
  isFinishStep = false,
  tourRegistry,
  tourTargetKey,
}) => {
  const itemWizardSuccessGoals = React.useMemo(
    () =>
      conditionGoalsFromItemWizardChoices(
        placement.worldItemKeys,
        placement.geometryKeys,
        worldItems,
        itemSuccessChoices
      ),
    [
      placement.worldItemKeys,
      placement.geometryKeys,
      worldItems,
      itemSuccessChoices,
    ]
  );

  const itemChoiceSummaries = React.useMemo(
    () =>
      itemSuccessChoiceSummaries(
        placement.worldItemKeys,
        placement.geometryKeys,
        worldItems,
        itemSuccessChoices
      ),
    [
      placement.worldItemKeys,
      placement.geometryKeys,
      worldItems,
      itemSuccessChoices,
    ]
  );

  const previewSuccessGoals = React.useMemo(() => {
    const merged = mergeConditionGoals([
      ...allZoneSuccessGoals(playZones),
      ...itemWizardSuccessGoals,
      ...successGoals,
    ]);
    return buildSuccessGoals(merged);
  }, [playZones, itemWizardSuccessGoals, successGoals]);

  const previewFailureGoals = React.useMemo(
    () => buildFailureGoals(friendlyFailureGoals(failureGoals)),
    [failureGoals]
  );

  const friendlyFailureGoalsForEditor = React.useMemo(
    () => friendlyFailureGoals(failureGoals),
    [failureGoals]
  );

  const onAddSuccessGoalsFromSuggestion_ = (
    goals: ConditionGoalInput[],
    step?: ItemSuccessWizardStep
  ) => {
    if (goals.length > 0) {
      onAddConditionSuccessGoals(goals, step);
    }
  };

  const helpText =
    step === 'success'
      ? tr('Set a goal for each item, then add any extra success rules.')
      : step === 'failure'
        ? tr('What ends the run early? Opposite failures are added for you.')
        : tr('Check your setup, then create the challenge.');

  return (
    <CustomChallengeWizardSidePanel
      theme={theme}
      locale={locale}
      stepLabel={stepLabel}
      helpText={helpText}
      onBack={onBack}
      onContinue={onContinue}
      onCancel={onCancel}
      continueLabel={continueLabel}
      isFinishStep={isFinishStep}
      continuePrimary
      tourRegistry={tourRegistry}
      tourTargetKey={tourTargetKey}
    >
      {step === 'success' ? (
        <>
          {playZones.length > 0 && (
            <>
              <SectionTitle theme={theme}>
                {LocalizedString.lookup(tr('Region goals'), locale)}
              </SectionTitle>
              {playZones.map(zone => {
                const goals = conditionGoalsFromPlayAreaZone(zone);
                return (
                  <Hint key={zone.id} theme={theme}>
                    <strong>{zone.name}</strong>
                    {goals.length > 0 ? (
                      <div>{goals.map(g => g.label).join(' · ')}</div>
                    ) : (
                      <div style={{ opacity: 0.8 }}>
                        {LocalizedString.lookup(tr('No goals for this region yet.'), locale)}
                      </div>
                    )}
                  </Hint>
                );
              })}
            </>
          )}
          <ItemSuccessWizard
            theme={theme}
            locale={locale}
            placement={placement}
            worldItems={worldItems}
            itemSuccessChoices={itemSuccessChoices}
            onItemSuccessChoicesChange={onItemSuccessChoicesChange}
            onApplySuccessGoals={onAddSuccessGoalsFromSuggestion_}
          />
          <DetailsSection theme={theme}>
            <summary>
              {LocalizedString.lookup(tr('More goals (optional)'), locale)}
            </summary>
            <div style={{ padding: `0 ${theme.itemPadding}px` }}>
              <JbcCatalogSuccessGoalPicker
                theme={theme}
                locale={locale}
                catalog={JBC_CATALOG_SUCCESS_GOALS}
                selectedKeys={selectedCatalogSuccessKeys}
                disabledKeys={disabledCatalogSuccessKeys}
                onToggle={onCatalogSuccessGoalToggle}
                listMaxHeight="28vh"
              />
            </div>
          </DetailsSection>
          <DetailsSection theme={theme}>
            <summary>
              {LocalizedString.lookup(tr('Advanced: edit goals'), locale)}
            </summary>
            <ConditionGoalsEditor
              theme={theme}
              locale={locale}
              title={LocalizedString.lookup(tr('Success goals'), locale)}
              helpText={LocalizedString.lookup(
                tr('Edit labels or tie goals to scene events.'),
                locale
              )}
              events={events}
              goals={successGoals}
              onChange={onSuccessGoalsChange}
            />
          </DetailsSection>
        </>
      ) : step === 'failure' ? (
        <>
          <SectionTitle theme={theme}>
            {LocalizedString.lookup(tr('Failure rules'), locale)}
          </SectionTitle>
          <Hint theme={theme}>
            {LocalizedString.lookup(
              tr('Any of these ends the run. Opposites of your success goals were added automatically.'),
              locale
            )}
          </Hint>
          {friendlyFailureGoalsForEditor.length > 0 ? (
            <div style={{ padding: `0 ${theme.itemPadding}px` }}>
              <ChallengeGoalsPreview
                theme={theme}
                locale={locale}
                successGoals={[]}
                failureGoals={previewFailureGoals}
              />
            </div>
          ) : (
            <Hint theme={theme}>
              {LocalizedString.lookup(
                tr('No failure rules yet.'),
                locale
              )}
            </Hint>
          )}
          <DetailsSection theme={theme}>
            <summary>
              {LocalizedString.lookup(tr('Advanced: edit failures'), locale)}
            </summary>
            <div style={{ padding: `0 ${theme.itemPadding}px` }}>
              <ConditionGoalsEditor
                theme={theme}
                locale={locale}
                title={LocalizedString.lookup(tr('Failure goals'), locale)}
                helpText={LocalizedString.lookup(
                  tr('Edit labels or add failure events.'),
                  locale
                )}
                events={events}
                goals={friendlyFailureGoalsForEditor}
                onChange={onFailureGoalsChange}
              />
            </div>
          </DetailsSection>
        </>
      ) : (
        <>
          <MatItemRulesSummary
            theme={theme}
            locale={locale}
            items={itemChoiceSummaries}
          />
          <ChallengeGoalsPreview
            theme={theme}
            locale={locale}
            successGoals={previewSuccessGoals}
            failureGoals={previewFailureGoals}
          />
        </>
      )}
    </CustomChallengeWizardSidePanel>
  );
};

export default CustomChallengeRulesSidePanel;
