import { ThemeProps } from "../constants/theme";
import Form from "../interface/Form";
import { Text } from "../interface/Text";
import React from "react";
import { styled } from "styletron-react";
import { StyledText } from "../../util";
import { StyleProps } from "util/style";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { TabBar } from "../Layout/TabBar";

export interface UserConsentCardPublicProps extends ThemeProps, StyleProps {
  disable: boolean;
  onCollectedUserConsent: () => void;
}

interface UserConsentCardPrivateProps {
}

interface UserConsentCardState {
  termsAccepted: boolean;
  tabIndex: number;
}

type Props = UserConsentCardPublicProps & UserConsentCardPrivateProps;
type State = UserConsentCardState;

const Container = styled('div', (props: ThemeProps) => ({
  marginLeft: `${props.theme.itemPadding * 2}px`,
  marginRight: `${props.theme.itemPadding * 2}px`,
  alignSelf: 'flex-start',
  width: `calc(100% - ${props.theme.itemPadding * 4}px)`,
}));

const StyledForm = styled(Form, (props: ThemeProps) => ({
  // paddingLeft: `${props.theme.itemPadding * 2}px`,
  // paddingRight: `${props.theme.itemPadding * 2}px`,
}));

const TextContainer = styled(Text, (props: ThemeProps) => ({
  // marginLeft: `${props.theme.itemPadding * 2}px`,
  // marginRight: `${props.theme.itemPadding * 2}px`,
  marginBottom: `${props.theme.itemPadding * 2}px`,
  // alignSelf: 'flex-start',
}));

const PlainTextContainer = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  alignSelf: 'flex-start',
  // marginLeft: `${props.theme.itemPadding * 2}px`,
  marginBottom: `${props.theme.itemPadding * 2}px`,
}));

const PdfFrame = styled('iframe', (props: ThemeProps) => ({
  // marginLeft: `${props.theme.itemPadding * 2}px`,
  // marginRight: `${props.theme.itemPadding * 2}px`,
  marginBottom: `${props.theme.itemPadding * 2}px`,
  height: '300px',
  width: '100%',
  // width: `calc(100% - ${props.theme.itemPadding * 4}px)`,
}));

const CheckboxLabel = styled('label', (props: ThemeProps) => ({
  color: props.theme.color,
  marginLeft: `${props.theme.itemPadding}px`,
}));

const StyledTabBar = styled(TabBar, (props: ThemeProps) => ({
  width: '100%',
  borderTop: `1px solid ${props.theme.borderColor}`,
  marginTop: `${props.theme.itemPadding * 2}px`,
}));

interface DocumentTabData {
  tabName: string;
  documentUrl: string;
}

class UserConsentCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      termsAccepted: false,
      tabIndex: 0,
    };
  }

  private static readonly documentTabData: DocumentTabData[] = [
    {
      tabName: 'Privacy Policy',
      documentUrl: '/static/eula/KIPR-Privacy-Policy-US-and-EU.pdf',
    },
    {
      tabName: 'Terms of Use',
      documentUrl: '/static/eula/KIPR-Website-Terms-of-Use.pdf',
    }
  ];

  private onTabIndexChange_ = (tabIndex: number) => {
    this.setState({ tabIndex });
  };

  render(): React.ReactNode {
    const { props, state } = this;
    const { theme, disable, onCollectedUserConsent } = props;
    const { tabIndex } = state;
    
    const tabs: TabBar.TabDescription[] = UserConsentCard.documentTabData.map(d => ({ name: d.tabName }));
    const pdfUrl = UserConsentCard.documentTabData[tabIndex].documentUrl;

    return <Container theme={theme}>
      <PlainTextContainer theme={theme}>Read and accept the privacy policy and terms of use below.</PlainTextContainer>
      {/* <TextContainer theme={theme} text={StyledText.text({
        text: "Read and accept the privacy policy and terms of use below.",
        style: {
          display: 'inline-block',
          color: theme.color,
        }
      })} /> */}

      <StyledTabBar theme={theme} tabs={tabs} index={tabIndex} onIndexChange={this.onTabIndexChange_}></StyledTabBar>
      <PdfFrame theme={theme} src={`${pdfUrl}#toolbar=0&navpanes=0`} />

      <div>
        <input type="checkbox" id="agreedToTerms" onChange={(e) => {
          const isChecked = e.target.checked;
          this.setState({ termsAccepted: isChecked });
        }} />
        <CheckboxLabel theme={theme} htmlFor="agreedToTerms">I have read and accept the privacy policy and terms of use</CheckboxLabel>
        {/* <PlainTextContainer theme={theme}>I have read and accept the privacy policy and terms of use</PlainTextContainer> */}

        {/* <Text text={StyledText.text({
          text: "I have read and accept the privacy policy and terms of use",
          style: {
            // display: 'inline-block',
            color: theme.color,
            marginLeft: theme.itemPadding,
            marginRight: theme.itemPadding,
          }
        })} /> */}
      </div >

      {/* TODO: support checkbox in StyledForm */}
      < StyledForm
        finalizeIcon={faSignInAlt}
        finalizeText={'Accept'}
        theme={theme}
        items={[]}
        verifiers={[]}
        onFinalize={onCollectedUserConsent}
        finalizeDisabled={disable || !state.termsAccepted
        }
      />
    </Container>;
  }
}

export default UserConsentCard;