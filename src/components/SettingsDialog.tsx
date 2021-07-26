import * as React from 'react';
import { styled } from 'styletron-react';
import { Settings } from '../Settings';
import { StyleProps } from '../style';
import { Dialog } from './Dialog';
import ScrollArea from './ScrollArea';
import { Switch } from './Switch';
import { ThemeProps } from './theme';

type SettingsSection = 'simulation' | 'editor';

export interface SettingsDialogProp extends ThemeProps, StyleProps {
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Partial<Settings>) => void;
}

interface SettingsDialogState {
  selectedSection: SettingsSection;
}

type Props = SettingsDialogProp;
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

export class SettingsDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSection: 'simulation',
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

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose } = props;
    const { selectedSection } = state;

    return (
      <Dialog theme={theme} name='Settings' onClose={onClose}>
        <Container theme={theme}>
          <SectionsColumn theme={theme}>
            <SectionName theme={theme} selected={selectedSection === 'simulation'} onClick={() => this.setSelectedSection('simulation')}>Simulation</SectionName>
            <SectionName theme={theme} selected={selectedSection === 'editor'} onClick={() => this.setSelectedSection('editor')}>Editor</SectionName>
          </SectionsColumn>
          <SettingsColumn theme={theme}>
            {selectedSection === 'simulation' && (
              <>
                {this.createBooleanSetting(
                  'Sensor noise',
                  'Controls whether sensor outputs are affected by random noise',
                  (settings: Settings) => settings.simulationSensorNoise,
                  (newValue: boolean) => ({ simulationSensorNoise: newValue })
                )}
                {this.createBooleanSetting(
                  'Realistic sensors',
                  'Controls whether sensors behave like real-world sensors instead of like ideal sensors. For example, real-world ET sensors are nonlinear',
                  (settings: Settings) => settings.simulationRealisticSensors,
                  (newValue: boolean) => ({ simulationRealisticSensors: newValue })
                )}
              </>
            )}
            {selectedSection === 'editor' && (
              <>
                {this.createBooleanSetting(
                  'Autocomplete',
                  'Controls autocompletion of code, brackets, and quotes',
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