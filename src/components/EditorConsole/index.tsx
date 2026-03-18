import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import { StyledText } from '../../util';
import ScrollArea from '../interface/ScrollArea';
import { Text } from '../interface/Text';
import { Theme, ThemeProps } from '../constants/theme';

import { FontAwesome } from '../FontAwesome';
import { Button } from '../interface/Button';
import { BarComponent } from '../interface/Widget';

import { faFile, faRobot } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import { TourRegistry } from '../../tours/TourRegistry';
import TourTarget from '../Tours/TourTarget';

export const createConsoleBarComponents = (
  theme: Theme,
  onClearConsole: () => void,
  onAskTutor: () => void,
  locale: LocalizedString.Language,
  tourRegistry?: TourRegistry,
) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const consoleBar: BarComponent<object>[] = [];

  consoleBar.push(BarComponent.create(Button, {
    theme,
    onClick: onClearConsole,
    children:
      <>
        <TourTarget registry={tourRegistry} targetKey={'console-clear-button'}>
          <FontAwesome icon={faFile} />
          {' '} {LocalizedString.lookup(tr('Clear'), locale)}
        </TourTarget>
      </>,
  }));

  consoleBar.push(BarComponent.create(Button, {
    theme,
    onClick: onAskTutor,
    children:
      <>
        <TourTarget registry={tourRegistry} targetKey={'ask-tutor-button'}>
          <FontAwesome icon={faRobot} />
          {' '} {LocalizedString.lookup(tr('Ask Tutor'), locale)}
        </TourTarget>
      </>,
  }));

  return consoleBar;
};

export interface ConsoleProps extends StyleProps, ThemeProps {
  text: StyledText;
}

interface ConsoleState {

}

type Props = ConsoleProps;
type State = ConsoleState;

const ConsoleText = styled(Text, (props: ThemeProps) => ({
  fontFamily: `'Roboto Mono', monospace`,
  fontSize: '0.9em',
  padding: `${props.theme.itemPadding * 2}px`,
  wordWrap: 'break-word',
  display: 'block'
}));

export class Console extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { style, className, theme, text } = this.props;
    return (
      <ScrollArea style={style} className={className} theme={theme} autoscroll>
        <ConsoleText theme={theme} text={text} />
      </ScrollArea>
    );
  }
}

export default Console;