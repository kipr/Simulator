import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { styled } from 'styletron-react';
import { Theme, ThemeProps } from '../constants/theme';
import { Message, MessageRole } from '../../state/State/Ai';
import ChatMessage from './ChatMessage';
import { FontAwesome } from '../FontAwesome';
import { faPaperPlane, faTrash } from '@fortawesome/free-solid-svg-icons';
import ScrollArea, { ScrollAreaRef } from '../interface/ScrollArea';

export interface ChatInterfaceProps extends ThemeProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
}

const Container = styled('div', ({ theme }: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  backgroundColor: theme.backgroundColor,
  overflow: 'hidden',
}));

const StyledScrollArea = (props: any) => (
  <ScrollArea {...props} />
);

const MessageList = styled(StyledScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
  padding: `${theme.itemPadding * 2}px`,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '300px', // Ensure this takes most of the space
}));

const InputContainer = styled('div', ({ theme }: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: `${theme.itemPadding * 2}px`,
  borderTop: `1px solid ${theme.borderColor}`,
  alignItems: 'center',
  minHeight: '60px',
  maxHeight: '100px',
}));

const Input = styled('textarea', ({ theme }: ThemeProps) => ({
  flex: 1,
  padding: `${theme.itemPadding}px`,
  borderRadius: `${theme.borderRadius}px`,
  border: `1px solid ${theme.borderColor}`,
  backgroundColor: theme.backgroundColor,
  color: theme.color,
  resize: 'none',
  fontFamily: 'inherit',
  fontSize: '14px',
  lineHeight: '1.5',
  minHeight: '40px',
  maxHeight: '80px',
  outline: 'none',
  ':focus': {
    border: `1px solid ${theme.borderColor}`,
  },
}));

const SendButton = styled('button', ({ theme }: ThemeProps) => ({
  marginLeft: `${theme.itemPadding}px`,
  padding: `${theme.itemPadding}px ${theme.itemPadding * 2}px`,
  borderRadius: `${theme.borderRadius}px`,
  border: 'none',
  backgroundColor: '#0078d4',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    opacity: 0.9,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));

const ClearButton = styled('button', ({ theme }: ThemeProps) => ({
  marginLeft: `${theme.itemPadding}px`,
  padding: `${theme.itemPadding}px`,
  borderRadius: `${theme.borderRadius}px`,
  border: 'none',
  backgroundColor: 'transparent',
  color: theme.color,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
}));

const LoadingIndicator = styled('div', ({ theme }: ThemeProps) => ({
  padding: `${theme.itemPadding * 2}px`,
  color: 'rgba(0, 0, 0, 0.5)',
  fontStyle: 'italic',
}));

const ErrorMessage = styled('div', ({ theme }: ThemeProps) => ({
  padding: `${theme.itemPadding * 2}px`,
  color: 'red',
  backgroundColor: 'rgba(255, 0, 0, 0.05)',
  margin: `${theme.itemPadding}px`,
  borderRadius: `${theme.borderRadius}px`,
}));

const EmptyState = styled('div', ({ theme }: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${theme.itemPadding * 4}px`,
  color: 'rgba(0, 0, 0, 0.5)',
  textAlign: 'center',
  height: '100%',
}));

const EmptyStateTitle = styled('h3', {
  margin: '0 0 8px 0',
});

const EmptyStateText = styled('p', {
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.5',
});

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  theme, 
  messages, 
  loading, 
  error, 
  onSendMessage, 
  onClearChat 
}) => {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<ScrollAreaRef>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.getScrollContainer();
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter key (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <Container theme={theme}>
      <MessageList theme={theme} ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <EmptyState theme={theme}>
            <EmptyStateTitle>Welcome to Claude Ai Assistant</EmptyStateTitle>
            <EmptyStateText>
              Ask me questions about programming, get help with your code, or discuss robotics concepts.
            </EmptyStateText>
          </EmptyState>
        ) : (
          <>
            {messages.map(message => (
              <ChatMessage key={message.id} theme={theme} message={message} />
            ))}
            {loading && (
              <LoadingIndicator theme={theme}>Claude is thinking...</LoadingIndicator>
            )}
            {error && (
              <ErrorMessage theme={theme}>{error}</ErrorMessage>
            )}
          </>
        )}
      </MessageList>
      <InputContainer theme={theme}>
        <Input
          theme={theme}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Ask Claude a question..."
          disabled={loading}
        />
        <SendButton
          theme={theme}
          onClick={handleSendMessage}
          disabled={loading || !inputValue.trim()}
        >
          <FontAwesome icon={faPaperPlane} />
        </SendButton>
        <ClearButton theme={theme} onClick={onClearChat} disabled={messages.length === 0}>
          <FontAwesome icon={faTrash} />
        </ClearButton>
      </InputContainer>
    </Container>
  );
};

export default ChatInterface;