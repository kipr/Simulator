import { styled } from "styletron-react";
import { ThemeProps } from "./theme";

export default styled('textarea', (props: ThemeProps) => ({
  outline: 'none',
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: `${props.theme.borderRadius}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  color: 'inherit',
  fontSize: 'inherit',
  resize: 'none',
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
}));