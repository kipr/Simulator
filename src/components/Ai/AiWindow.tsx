import * as React from 'react';
import { useState, useCallback } from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';

import { Theme, ThemeProps } from '../constants/theme';
import Widget, { BarComponent, Mode, Size } from '../interface/Widget';
import ChatInterface from './ChatInterface';
import AiRoot from './AiRoot';

import { State as ReduxState } from '../../state';
import { AiAction } from '../../state/reducer';
import { sendMessage } from '../../util/ai';
import { Message, MessageRole } from '../../state/State/Ai';
import { FontAwesome } from '../FontAwesome';
import { faFile, faRobot } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import Button from '../interface/Button';
import Robot from 'state/State/Robot';
import ProgrammingLanguage from 'programming/compiler/ProgrammingLanguage';

export interface AiWindowPublicProps extends ThemeProps {
  code: string;
  language: ProgrammingLanguage;
  console: string;
  robot: Robot;
}

interface AiWindowPrivateProps {
  visible: boolean;
  messages: Message[];
  size: Size;
  loading: boolean;

  locale: LocalizedString.Language;

  onClearChat: () => void;

  onSizeChange: (size: Size) => void;
  onSetVisible: (visible: boolean) => void;
  onClearMessages: () => void;
  onSendMessage: (content: string) => void;
}

type Props = AiWindowPublicProps & AiWindowPrivateProps;

const Container = styled('div', ({ theme, $width, $height }: ThemeProps & { $width: string; $height: string; }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: $width,
  height: $height,
  color: theme.color,
  backgroundColor: theme.backgroundColor,
  overflow: 'hidden',
  fontSize: '12px',
}));

const AiWindow: React.FC<Props> = ({
  theme,
  visible,
  messages,
  size,
  loading,
  locale,
  onClearChat,
  onSizeChange,
  onSetVisible,
  onClearMessages,
  onSendMessage,
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragState, setDragState] = useState({ type: 'none' });

  // Calculate container width based on size
  const containerWidth = React.useMemo(() => {
    return size.type === Size.Type.Maximized ? window.innerWidth : 550;
  }, [size.type]);

  const handleChromeMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = position.x;
    const startPosY = position.y;

    setDragState({ type: 'dragging' });

    const onMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: startPosX + (moveEvent.clientX - startX),
        y: startPosY + (moveEvent.clientY - startY),
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setDragState({ type: 'none' });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [position]);

  const SIZES = [Size.MAXIMIZED, Size.PARTIAL, Size.MINIMIZED];
  
  const handleSizeChange = useCallback((index: number) => {
    const newSize = SIZES[index];
    if (newSize.type === Size.Type.Minimized) {
      onSetVisible(false);
    } else {
      onSizeChange(newSize);
    }
  }, [onSizeChange, onSetVisible, SIZES]);

  const handleSendMessage = useCallback((content: string) => {
    onSendMessage(content);
  }, [onSendMessage]);

  const onClearClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onClearChat();
  }, [onClearChat]);

  // Don't render if not visible
  if (!visible || size.type === Size.Type.Minimized) return null;

  const sizeIndex = SIZES.findIndex(s => s.type === size.type);

  let mode = Mode.Floating;
  const style: React.CSSProperties = {
    position: 'absolute',
    opacity: dragState.type === 'dragging' ? 0.8 : 1,
  };

  switch (size.type) {
    case Size.Type.Partial: {
      style.left = `${position.x}px`;
      style.top = `${position.y}px`;
      break;
    }
    case Size.Type.Maximized: {
      mode = Mode.Inline;
      style.left = '0px';
      style.top = '0px';
      style.width = '100%';
      style.height = '100%';
      break;
    }
  }

  return (
    <AiRoot>
      <Widget
        name={LocalizedString.lookup(tr("Tutor"), locale)}
        theme={theme}
        mode={mode}
        style={style}
        onChromeMouseDown={size.type !== Size.Type.Maximized ? handleChromeMouseDown : undefined}
        size={sizeIndex}
        sizes={SIZES}
        onSizeChange={handleSizeChange}
        barComponents={[BarComponent.create(Button, {
          theme,
          onClick: onClearClick,
          children:
            <>
              <FontAwesome icon={faFile} />
              {' '} {LocalizedString.lookup(tr('Clear'), locale)}
            </>,
        })]}
      >
        <Container theme={theme}
          $width={`${size.type === Size.Type.Maximized ? '100%' : '550px'}`}
          $height={`${size.type === Size.Type.Maximized ? '100%' : '500px'}`}
        >
          <ChatInterface
            theme={theme}
            messages={messages}
            loading={loading}
            containerWidth={containerWidth}
            onSendMessage={handleSendMessage}
          />
        </Container>
      </Widget>
    </AiRoot>
  );
};

export default connect((state: ReduxState) => ({
  visible: state.ai.visible,
  messages: state.ai.messages,
  size: state.ai.size,
  loading: state.ai.loading,
  locale: state.i18n.locale,
}), (dispatch, { code, language, console, robot }: AiWindowPublicProps) => ({
  onSizeChange: (size: Size) => dispatch(AiAction.setSize({ size })),
  onSetVisible: (visible: boolean) => dispatch(AiAction.setVisible({ visible })),
  onClearMessages: () => dispatch(AiAction.CLEAR_MESSAGES),
  onSendMessage: (content: string) => sendMessage(dispatch, { content, code, language, console, robot }),
  onClearChat: () => dispatch(AiAction.CLEAR_MESSAGES),
}))(AiWindow) as React.ComponentType<AiWindowPublicProps>; 
