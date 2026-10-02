import { styled } from "styletron-react";
import { ThemeProps } from "../constants/theme";

export default styled('input', (props: ThemeProps) => ({
  outline: 'none',
  border: props.theme.themeName === 'DARK' ? `1px solid ${props.theme.inputBoxBorderColor}` : `1px solid ${props.theme.borderColor}`,
  borderRadius: `${props.theme.borderRadius}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  color: 'inherit',
  fontSize: 'inherit',
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
}));