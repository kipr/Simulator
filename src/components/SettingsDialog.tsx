import * as React from 'react';
import { styled } from 'styletron-react';
import { Settings } from '../Settings';
import { StyleProps } from '../style';
import { Dialog } from './Dialog';
import ScrollArea from './ScrollArea';
import { Switch } from './Switch';
import { ThemeProps } from './theme';

import tr from '@i18n';
import LocalizedString from '../util/LocalizedString';
import ComboBox from './ComboBox';
import Dict from '../Dict';

import { State as ReduxState } from '../state';
import { I18nAction } from '../state/reducer';
import { connect } from 'react-redux';

type SettingsSection = 'user-interface' | 'simulation' | 'editor';

export interface SettingsDialogPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Partial<Settings>) => void;
}

interface SettingsDialogPrivateProps {
  locale: LocalizedString.Language;
  onLocaleChange: (locale: LocalizedString.Language) => void;
}

interface SettingsDialogState {
  selectedSection: SettingsSection;
}

type Props = SettingsDialogPublicProps & SettingsDialogPrivateProps;
type State = SettingsDialogState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  color: props.theme.color,
  minHeight: '300px',
}));

const SectionsColumn = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '0 0 150px',
  borderRight: `1px solid ${props.theme.borderColor}`,
}));

const SectionName = styled('span', (props: ThemeProps & SectionProps) => ({
  backgroundColor: props.selected ? `rgba(255, 255, 255, 0.1)` : undefined,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  transition: 'background-color 0.2s, opacity 0.2s',
  padding: `${props.theme.itemPadding * 2}px`,
  fontWeight: props.selected ? 400 : undefined,
  userSelect: 'none',
}));

const SettingsColumn = styled(ScrollArea, {
  flex: '1 1',
});

const SettingContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: `${props.theme.itemPadding * 2}px`,
}));

const SettingInfoContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0',
});

const SettingInfoText = styled('span', {
  userSelect: 'none',
});

const SettingInfoSubtext = styled(SettingInfoText, {
  fontSize: '10pt',
});

interface SectionProps {
  selected?: boolean;
}

const LOCALE_OPTIONS: ComboBox.Option[] = (() => {
  const ret: ComboBox.Option[] = [];
  for (const locale of [LocalizedString.EN_US]) {
    ret.push(ComboBox.option(LocalizedString.NATIVE_LOCALE_NAMES[locale], locale));
  }
  return ret;
})();

const StyledComboBox = styled(ComboBox, {
  flex: '1 1',
});

class SettingsDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSection: 'user-interface',
    };
  }

  private setSelectedSection = (selectedSection: SettingsSection) => {
    this.setState({ selectedSection });
  };

  private createBooleanSetting = (text: string, subtext: string, getValue: (settings: Settings) => boolean, getUpdatedSettings: (newValue: boolean) => Partial<Settings>) => {
    const { theme, settings: currentSettings, onSettingsChange } = this.props;

    return (
      <SettingContainer theme={theme}>
        <SettingInfoContainer>
          <SettingInfoText>{text}</SettingInfoText>
          <SettingInfoSubtext>{subtext}</SettingInfoSubtext>
        </SettingInfoContainer>
        <Switch theme={theme} value={getValue(currentSettings)} onValueChange={(value) => {
          onSettingsChange(getUpdatedSettings(value));
        }} />
      </SettingContainer>
    );
  };

  private onLocaleSelect_ = (index: number, option: ComboBox.Option) => {
    this.props.onLocaleChange(option.data as LocalizedString.Language);
  };


  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale } = props;
    const { selectedSection } = state;

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Settings'), locale)}
        onClose={onClose}
      >
        <Container theme={theme} style={style} className={className}>
          <SectionsColumn theme={theme}>
            <SectionName
              theme={theme}
              selected={selectedSection === 'user-interface'}
              onClick={() => this.setSelectedSection('user-interface')}
            >
              {LocalizedString.lookup(tr('User Interface'), locale)}
            </SectionName>
            <SectionName
              theme={theme}
              selected={selectedSection === 'simulation'}
              onClick={() => this.setSelectedSection('simulation')}
            >
              {LocalizedString.lookup(tr('Simulation'), locale)}
            </SectionName>
            <SectionName
              theme={theme}
              selected={selectedSection === 'editor'}
              onClick={() => this.setSelectedSection('editor')}
            >
              {LocalizedString.lookup(tr('Editor'), locale)}
            </SectionName>
          </SectionsColumn>
          <SettingsColumn theme={theme}>
            {selectedSection === 'user-interface' && (
              <>
                <SettingContainer theme={theme}>
                  <SettingInfoContainer>
                    <SettingInfoText>{LocalizedString.lookup(tr('Locale'), locale)}</SettingInfoText>
                    <SettingInfoSubtext>{LocalizedString.lookup(tr('Switch languages'), locale)}</SettingInfoSubtext>
                  </SettingInfoContainer>
                  <StyledComboBox
                    options={LOCALE_OPTIONS}
                    index={LOCALE_OPTIONS.findIndex(opt => opt.data === locale)}
                    onSelect={this.onLocaleSelect_}
                    theme={theme}
                  />
                </SettingContainer>
              </>
            )}
            {selectedSection === 'simulation' && (
              <>
                {this.createBooleanSetting(
                  LocalizedString.lookup(tr('Sensor noise'), locale),
                  LocalizedString.lookup(tr('Controls whether sensor outputs are affected by random noise'), locale),
                  (settings: Settings) => settings.simulationSensorNoise,
                  (newValue: boolean) => ({ simulationSensorNoise: newValue })
                )}
                {this.createBooleanSetting(
                  LocalizedString.lookup(tr('Realistic sensors'), locale),
                  LocalizedString.lookup(tr('Controls whether sensors behave like real-world sensors instead of like ideal sensors. For example, real-world ET sensors are nonlinear'), locale),
                  (settings: Settings) => settings.simulationRealisticSensors,
                  (newValue: boolean) => ({ simulationRealisticSensors: newValue })
                )}
              </>
            )}
            {selectedSection === 'editor' && (
              <>
                {this.createBooleanSetting(
                  LocalizedString.lookup(tr('Autocomplete'), locale),
                  LocalizedString.lookup(tr('Controls autocompletion of code, brackets, and quotes'), locale),
                  (settings: Settings) => settings.editorAutoComplete,
                  (newValue: boolean) => ({ editorAutoComplete: newValue })
                )}
              </>
            )}
          </SettingsColumn>
        </Container>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale
}), dispatch => ({
  onLocaleChange: (locale: LocalizedString.Language) => dispatch(I18nAction.setLocale({ locale })),
}))(SettingsDialog) as React.ComponentType<SettingsDialogPublicProps>;