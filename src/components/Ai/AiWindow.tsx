import * as React from 'react';
import { useState, useCallback } from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';

import { ThemeProps } from '../constants/theme';
import Widget, { Mode, Size } from '../interface/Widget';
import ChatInterface from './ChatInterface';
import AiRoot from './AiRoot';

import { State as ReduxState } from '../../state';
import { AiAction } from '../../state/reducer';
import { Message, MessageRole } from '../../state/State/Ai';
import { FontAwesome } from '../FontAwesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

export interface AiWindowPublicProps extends ThemeProps {
  
}

interface AiWindowPrivateProps {
  visible: boolean;
  messages: Message[];
  size: Size;
  loading: boolean;
  error: string | null;

  onSizeChange: (size: Size) => void;
  onSetVisible: (visible: boolean) => void;
  onAddUserMessage: (content: string) => void;
  onAddAssistantMessage: (content: string) => void;
  onSetLoading: (loading: boolean) => void;
  onSetError: (error: string) => void;
  onClearError: () => void;
  onClearMessages: () => void;
}

type Props = AiWindowPublicProps & AiWindowPrivateProps;

const Container = styled('div', ({ theme }: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  minWidth: '450px',
  width: '100%',
  height: '100%',
  color: theme.color,
  backgroundColor: theme.backgroundColor,
  overflow: 'hidden',
}));

const AiWindow: React.FC<Props> = ({
  theme,
  visible,
  messages,
  size,
  loading,
  error,
  onSizeChange,
  onSetVisible,
  onAddUserMessage,
  onAddAssistantMessage,
  onSetLoading,
  onSetError,
  onClearError,
  onClearMessages,
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });

  const handleChromeMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = position.x;
    const startPosY = position.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: startPosX + (moveEvent.clientX - startX),
        y: startPosY + (moveEvent.clientY - startY),
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [position]);

  const SIZES = [Size.MAXIMIZED, Size.PARTIAL, Size.MINIMIZED];
  
  const handleSizeChange = useCallback((index: number) => {
    onSizeChange(SIZES[index]);
  }, [onSizeChange, SIZES]);

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message to chat
    onAddUserMessage(content);
    
    // Set loading state
    onSetLoading(true);
    
    try {
      // Get auth token from localStorage (assuming it's stored there)
      const token = localStorage.getItem('firebase-token');
      
      if (!token) {
        throw new Error('Not authenticated. Please sign in.');
      }
      
      // Prepare messages for API call (include only content and role)
      const apiMessages = messages.map(message => ({
        role: message.role,
        content: message.content
      }));
      
      // Add the new user message
      apiMessages.push({
        role: MessageRole.User,
        content
      });
      
      // Call Claude API
      const response = await fetch('/api/claude/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: apiMessages })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error calling Claude API');
      }
      
      const data = await response.json();
      
      // Add Claude's response to chat
      const assistantMessage = data.content[0].text;
      onAddAssistantMessage(assistantMessage);
    } catch (error) {
      // Handle errors
      console.error('Error sending message to Claude API:', error);
      let errorMessage = 'An error occurred while communicating with Claude.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      onSetError(errorMessage);
    } finally {
      // Clear loading state
      onSetLoading(false);
    }
  }, [messages, onAddUserMessage, onAddAssistantMessage, onSetLoading, onSetError]);

  // Don't render if not visible
  if (!visible || size.type === Size.Type.Minimized) return null;

  const sizeIndex = SIZES.findIndex(s => s.type === size.type);

  let mode = Mode.Floating;
  const style: React.CSSProperties = {
    position: 'absolute',
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
        name="Claude Ai Assistant"
        theme={theme}
        mode={mode}
        style={style}
        onChromeMouseDown={size.type !== Size.Type.Maximized ? handleChromeMouseDown : undefined}
        size={sizeIndex}
        sizes={SIZES}
        onSizeChange={handleSizeChange}
        barComponents={[
          { component: FontAwesome, props: { icon: faRobot, style: { marginLeft: 8 } } }
        ]}
      >
        <Container theme={theme}>
          <ChatInterface
            theme={theme}
            messages={messages}
            loading={loading}
            error={error}
            onSendMessage={handleSendMessage}
            onClearChat={onClearMessages}
          />
        </Container>
      </Widget>
    </AiRoot>
  );
};

export default connect((state: ReduxState) => {
  return {
    visible: state.ai.visible,
    messages: state.ai.messages,
    size: state.ai.size,
    loading: state.ai.loading,
    error: state.ai.error,
  };
}, dispatch => ({
  onSizeChange: (size: Size) => dispatch(AiAction.setSize({ size })),
  onSetVisible: (visible: boolean) => dispatch(AiAction.setVisible({ visible })),
  onAddUserMessage: (content: string) => dispatch(AiAction.addUserMessage({ content })),
  onAddAssistantMessage: (content: string) => dispatch(AiAction.addAssistantMessage({ content })),
  onSetLoading: (loading: boolean) => dispatch(AiAction.setLoading({ loading })),
  onSetError: (error: string) => dispatch(AiAction.setError({ error })),
  onClearError: () => dispatch(AiAction.CLEAR_ERROR),
  onClearMessages: () => dispatch(AiAction.CLEAR_MESSAGES),
}))(AiWindow) as React.ComponentType<AiWindowPublicProps>; 