import { styled } from "styletron-react";
import { ThemeProps } from "../theme";

const FeedbackTextArea = styled('textarea', (props: ThemeProps) => ({
  outline: 'none',
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: `${props.theme.borderRadius}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  color: 'inherit',
  fontSize: 'inherit',
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  margin: '5px 0 5px 0',
  minHeight: '200px',
}));

const FeedbackText = styled('span', {
  userSelect: 'none',
});

const FeedbackLabel = styled('span', {
  padding: '0 10px 0 0',
});

const FeedbackEmailInput = styled('input', (props: ThemeProps) => ({
  outline: 'none',
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: `${props.theme.borderRadius}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  color: 'inherit',
  fontSize: 'inherit',
  minWidth: '400px',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
}));

export { FeedbackTextArea, FeedbackText, FeedbackLabel, FeedbackEmailInput };