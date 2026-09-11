import React from "react";
import { Card, CardProps } from "../../components/interface/Card";
import { styled } from "styletron-react";
import { ThemeProps } from "components/constants/theme";
import LocalizedString from "../../util/LocalizedString";
import { connect } from "react-redux";
import { State as ReduxState } from "../../state";
import { withNavigate } from "util/withNavigate";

import tr from '@i18n';
export interface ChallengeCardProps extends CardProps, ThemeProps {
  cardContent: { title: LocalizedString; description: LocalizedString };
}

interface ChallengeCardPrivateProps {
  locale: LocalizedString.Language;
}

interface ChallengeCardState {
  isHovered: boolean;

}

interface SvgOverlayProps {
  $showOverlay: boolean;
}


type Props = ChallengeCardProps & ChallengeCardPrivateProps;
type State = ChallengeCardState;
const SvgOverlay = styled('svg', (props: ThemeProps & SvgOverlayProps) => ({
  borderRadius: `${props.theme.itemPadding * 4}px`,
  overflow: 'hidden',
  // left: '11px',
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  transform: props.$showOverlay
    ? 'translateY(0%)'
    : 'translateY(100%)',
  transition: 'transform 0.5s ease '
}));


const ChallengeCardContainer = styled('div', (props: ThemeProps & { customwidth?: string; customheight?: string; custommargin?: string }) => ({
  position: 'relative',

  // width: props.customwidth ?? '350px',
  // height: props.customheight ?? '350px',
  backgroundImage: 'none',
  margin: props.custommargin ?? '20px 20px 0px 20px',
  borderRadius: `${props.theme.itemPadding * 4}px`,
  overflow: 'hidden',
  ':hover': {
    cursor: 'pointer',
  },
}));


const DescriptionContainer = styled('div', (props: SvgOverlayProps) => ({
  position: 'absolute',
  inset: '0',
  fontSize: '0.9em',
  paddingTop: '72%',
  paddingLeft: '10px',
  paddingRight: '15%',
  paddingBottom: '10px',
  opacity: props.$showOverlay ? 1 : 0,

  transition: props.$showOverlay
    ? 'opacity 0.3s ease 0.3s'
    : 'opacity 0.2s ease',

  pointerEvents: props.$showOverlay ? 'auto' : 'none',
  boxSizing: 'border-box',
  overflow: 'hidden',

  clipPath:
    'polygon(0% 50%, 27% 50%, 60% 70%, 82% 70%, 100% 89%, 100% 100%, 0% 100%)',
}));
class ChallengeCard extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isHovered: false,
    };
  }
  private handleClick = (event: React.MouseEvent) => {
    this.props.onClick(event);
  }

  render() {
    const { state, props } = this;
    const { isHovered } = state;
    const filteredDescription = LocalizedString.lookup(this.props.cardContent.description, this.props.locale).split(':')[1]?.trim();
    return (
      <ChallengeCardContainer
        className="custommargin"
        custommargin="0px"
        theme={this.props.theme}
        onClick={(event) => this.handleClick(event)}
        onMouseEnter={() => this.setState({ isHovered: true })}
        onMouseLeave={() => this.setState({ isHovered: false })}
      >
        <Card
          custommargin="0px" {...this.props} onClick={() => ({})} />
        <SvgOverlay
          theme={this.props.theme}
          viewBox="0 0 100 100"
          $showOverlay={this.state.isHovered || this.props.selected}
        >
          <defs>
            <clipPath id="cardClip">
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                rx="5"
                ry="5"
              />
            </clipPath>

            {/* Main red gradient */}
            <linearGradient id="redGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff3038" />
              <stop offset="55%" stopColor="#ef1c26" />
              <stop offset="100%" stopColor="#9d0710" />
            </linearGradient>

            {/* Slightly darker layer */}
            <linearGradient id="darkRedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d91821" />
              <stop offset="100%" stopColor="#85060c" />
            </linearGradient>

            {/* Highlight */}
            <linearGradient id="highlightGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Dot pattern */}
            <pattern
              id="dotPattern"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="1"
                cy="1"
                r="0.6"
                fill="white"
                opacity="0.18"
              />
            </pattern>
          </defs>

          <g clipPath="url(#cardClip)">

            {/* Main red body */}
            <path
              d="
        M 0 100
        L 0 50
        L 27 50
        Q 30 50 33 52
        L 57 68
        Q 60 70 64 70
        L 82 70
        Q 85 70 88 73
        L 97 82
        Q 100 85 100 89
        L 100 100
        Z
      "
              fill="url(#redGradient)"
            />

            {/* Dark 3D lower layer */}
            <path
              d="
        M 0 72
        Q 18 67 31 74
        Q 46 82 60 79
        Q 75 76 100 88
        L 100 100
        L 0 100
        Z
      "
              fill="url(#darkRedGradient)"
              opacity="0.7"
            />

            {/* Raised / glossy top ridge */}
            <path
              d="
        M 0 50
        L 27 50
        Q 30 50 33 52
        L 57 68
        Q 60 70 64 70
        L 82 70
        Q 85 70 88 73
        L 97 82
      "
              fill="none"
              stroke="url(#highlightGradient)"
              strokeWidth="1.2"
              opacity="0.9"
            />

            {/* Secondary ridge for depth */}
            <path
              d="
        M 0 55
        Q 18 52 30 58
        Q 45 65 54 71
        Q 61 75 74 74
        Q 88 73 100 85
      "
              fill="none"
              stroke="#7f060c"
              strokeWidth="1.1"
              opacity="0.35"
            />

            {/* Tech diagonal bars */}
            <g
              fill="white"
              opacity="0.32"
            >
              <path d="M 4 58 L 8 58 L 13 53 L 9 53 Z" />
              <path d="M 10 58 L 14 58 L 19 53 L 15 53 Z" />
              <path d="M 16 58 L 20 58 L 25 53 L 21 53 Z" />
            </g>

            {/* Circuit traces */}
            <g
              fill="none"
              stroke="white"
              strokeWidth="0.55"
              opacity="0.35"
            >
              <path d="M 5 65 H 19 L 24 70 H 35" />
              <path d="M 8 70 H 28 L 34 76 H 48" />
              <path d="M 40 64 H 49 L 58 72 H 72" />
              <path d="M 55 78 H 66 L 72 84 H 90" />
              <path d="M 68 72 H 78 L 84 78 H 91" />
            </g>

            {/* Circuit nodes */}
            <g
              fill="#ef1c26"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.85"
            >
              <circle cx="35" cy="70" r="1.5" />
              <circle cx="48" cy="76" r="1.5" />
              <circle cx="72" cy="72" r="1.5" />
              <circle cx="90" cy="84" r="1.5" />
            </g>

            {/* Dot matrix accent */}
            <path
              d="
        M 72 83
        Q 84 79 100 82
        L 100 100
        L 78 100
        Q 70 94 72 83
        Z
      "
              fill="url(#dotPattern)"
              opacity="0.75"
            />

            {/* Small glowing tech accent */}
            <circle
              cx="95"
              cy="81"
              r="0.8"
              fill="white"
              opacity="0.55"
            />

          </g>
        </SvgOverlay>
        <DescriptionContainer $showOverlay={isHovered || this.props.selected}>
          <div style={{ fontWeight: 600, stroke: 'black', strokeWidth: '0.5px', textShadow: '1px 1px 2px black' }}>
            {filteredDescription}
          </div>
        </DescriptionContainer>


      </ChallengeCardContainer>
    );
  }
}

const ConnectedChallengeCard = connect<unknown, unknown, Props>((state: ReduxState) => ({
  scenes: state.scenes,
  locale: state.i18n.locale,
}), dispatch => ({
}))(ChallengeCard) as React.ComponentType<ChallengeCardProps>;

export default ConnectedChallengeCard;