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

type Props = ChallengeCardProps & ChallengeCardPrivateProps;

const SvgOverlay = styled('svg', (props: ThemeProps) => ({
  borderRadius: `${props.theme.itemPadding * 4}px`,
  overflow: 'hidden',
  //left: '11px',
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
}));


const ChallengeCardContainer = styled('div', (props: ThemeProps & { customwidth?: string; customheight?: string; custommargin?: string }) => ({
  position: 'relative',

  // width: props.customwidth ?? '350px',
  // height: props.customheight ?? '350px',

  margin: props.custommargin ?? '20px 20px 0px 20px',
}));

const DescriptionContainer = styled('div', (props: ThemeProps) => ({
  position: 'absolute',
  bottom: `1.1em`,
  left: '5px',
  // right: `${props.theme.itemPadding * 2}px`,
  justifyItems: 'start',
  color: props.theme.textColor,
  fontSize: '0.9em',
  textAlign: 'center',
  maxWidth: '100%',
}));

class ChallengeCard extends React.PureComponent<Props> {

  render() {
    const filteredDescription = LocalizedString.lookup(this.props.cardContent.description, this.props.locale).split(':')[1]?.trim();
    return (
      <ChallengeCardContainer className="custommargin" custommargin="0px" theme={this.props.theme}>
        <Card custommargin="0px" {...this.props} />

        <SvgOverlay theme={this.props.theme} viewBox="0 0 100 100">
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
          </defs>

          <path
            d=" M 0 100 L 0 50 L 27 50 Q 30 50 33 52 L 57 68 Q 60 70 64 70 L 82 70 Q 85 70 88 73 L 97 82 Q 100 85 100 89 L 100 100 Z"
            fill="#ef1c26"
            clipPath="url(#cardClip)"
          />

        </SvgOverlay>

        <DescriptionContainer theme={this.props.theme}>
          <div>
            {LocalizedString.lookup(
              this.props.cardContent.title,
              this.props.locale
            )}
          </div>
          <div>
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