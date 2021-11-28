import * as React from "react";
import { styled } from "styletron-react";
import { StyleProps } from "../style";
import { ThemeProps } from "./theme";

export interface CardProps extends StyleProps, ThemeProps {
  title?: string;
  description?: string;
  link?: string;
  src?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  hoverBackgroundSize?: string;
  onSelect?: (index: number) => void;
  selected?: boolean;
  index?: number;
}

interface CardState { }

type Props = CardProps;
type State = CardState;

const Container = styled('div', (props: ThemeProps & {
  backgroundimage: string;
  backgroundcolor: string;
  backgroundposition: string;
  backgroundsize: string;
  hoverbackgroundsize: string;
}) => ({
  width: '100%',
  height: '100%',
  minWidth: '320px',
  maxWidth: '350px',
  maxHeight: '350px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  opacity: 0.98,
  backdropFilter: 'blur(16px)',
  paddingTop: `${props.theme.itemPadding * 2}px`,
  paddingBottom: '0px',
  margin: '20px 20px 0px 20px',
  backgroundColor: props.backgroundcolor ? props.backgroundcolor : props.theme.backgroundColor,
  borderRadius: `${props.theme.itemPadding * 4}px`,
  border: `1px solid ${props.theme.borderColor}`,
  overflow: 'hidden',
  backgroundImage: props.backgroundimage ? props.backgroundimage : 'none',
  backgroundPosition: props.backgroundposition ? props.backgroundposition : 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: props.backgroundsize ? props.backgroundsize : '100%',
  transition: 'all 0.5s ease',
  ':hover': {
    backgroundSize: props.hoverbackgroundsize ? props.hoverbackgroundsize : '115%',
    cursor: 'pointer',
  }
}));

const Gradient = styled('div', (props: ThemeProps) => ({
  width: '100%',
  height: '100%',
  borderRadius: `${props.theme.itemPadding * 4}px`,
  position: 'absolute',
  top: 0,
  opacity: 0,
  background: `linear-gradient(to top, transparent 50%, ${props.theme.backgroundColor} 100%)`,
  transition: 'opacity 2s ease',
  ':hover': {
    opacity: 0.6
  }
}));

const Header = styled('div', (props: ThemeProps) => ({
  fontSize: '2em',
  position: 'absolute',
  color: props.theme.color,
  fontWeight: 800,
  alignSelf: 'flex-start',
  marginLeft: `${props.theme.itemPadding * 2}px`,
  marginBottom: `${props.theme.itemPadding * 2}px`,
}));

const Description = styled('div', (props: ThemeProps) => ({
  fontSize: '1em',
  position: 'absolute',
  top: '3em',
  color: props.theme.color,
  fontWeight: 400,
  alignSelf: 'flex-start',
  marginLeft: `${props.theme.itemPadding * 2}px`,
  marginBottom: `${props.theme.itemPadding * 2}px`,
}));

export class Card extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private onClick_ = () => {
    if (this.props.link) {
      window.location.href = this.props.link;
    } else if (this.props.src) {
      this.props.onSelect(this.props.index);
    }
  };

  render() {
    const { 
      backgroundImage,
      backgroundColor,
      backgroundPosition,
      backgroundSize,
      hoverBackgroundSize,
      title,
      description,
      theme
    } = this.props;

    return (
      <Container 
        theme={theme} 
        backgroundimage={backgroundImage} 
        backgroundcolor={backgroundColor}
        backgroundposition={backgroundPosition}
        backgroundsize={backgroundSize}
        hoverbackgroundsize={hoverBackgroundSize}
        onClick={this.onClick_}
      >
        <Gradient theme={theme} />
        <Header theme={theme}>{title}</Header>
        <Description theme={theme}>{description}</Description>
      </Container>
    );
  }
}
export default Card;