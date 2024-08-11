import { ThemeProps } from "../constants/theme";
import Form from "../interface/Form";
import { Text } from "../interface/Text";
import React from "react";
import { styled } from "styletron-react";
import { StyleProps } from "util/style";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { TabBar } from "../Layout/TabBar";
import PdfPage from "../PdfPage";
import { GlobalWorkerOptions, PDFPageProxy, getDocument } from 'pdfjs-dist';

// TODO: make this point to a local file that gets deployed
// TODO: centralize somewhere in the app
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

export interface UserConsentCardPublicProps extends ThemeProps, StyleProps {
  disable: boolean;
  onCollectedUserConsent: () => void;
}

interface UserConsentCardPrivateProps {
}

interface UserConsentCardState {
  termsAccepted: boolean;
  tabIndex: number;
  pdfPagesLists: PDFPageProxy[][];
}

type Props = UserConsentCardPublicProps & UserConsentCardPrivateProps;
type State = UserConsentCardState;

const Container = styled('div', (props: ThemeProps) => ({
  marginLeft: `${props.theme.itemPadding * 2}px`,
  marginRight: `${props.theme.itemPadding * 2}px`,
  alignSelf: 'flex-start',
  width: `calc(100% - ${props.theme.itemPadding * 4}px)`,
}));

const PdfContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '300px',
  overflow: 'auto',
  marginBottom: `${props.theme.itemPadding * 2}px`,
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
      pdfPagesLists: [],
    };
  }

  async componentDidMount(): Promise<void> {
    // Get PDFs for each document tab and store the PDF pages in state
    for (let documentTabIndex = 0; documentTabIndex < UserConsentCard.documentTabData.length; ++documentTabIndex) {
      this.getPdfFromUrl(UserConsentCard.documentTabData[documentTabIndex].documentUrl).then(pdfPages => {
        this.setState((prevState) => {
          const pdfPagesLists = [...prevState.pdfPagesLists];
          pdfPagesLists[documentTabIndex] = pdfPages;
          return { pdfPagesLists };
        });
      });
    }
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

  private getPdfFromUrl = async (url: string) => {
    const pdfResponse = await fetch(url);

    if (!pdfResponse.ok) {
      console.error('Failed to fetch PDF', pdfResponse.status);
      return null;
    }

    const pdfResponseBody = await pdfResponse.arrayBuffer()

    const pdf = await getDocument(pdfResponseBody).promise;

    const pagePromises: Promise<PDFPageProxy>[] = [];
    for (let i = 1; i <= pdf.numPages; ++i) {
      pagePromises.push(pdf.getPage(i));
    }
    
    const pages = await Promise.all(pagePromises);

    return pages;
  };

  private onTabIndexChange_ = (tabIndex: number) => {
    this.setState({ tabIndex });
  };

  render(): React.ReactNode {
    const { props, state } = this;
    const { theme, disable, onCollectedUserConsent } = props;
    const { tabIndex, pdfPagesLists } = state;
    
    const tabs: TabBar.TabDescription[] = UserConsentCard.documentTabData.map(d => ({ name: d.tabName }));

    const pdfPages = pdfPagesLists[tabIndex];
    const pdfPageComponents = pdfPages
      ? pdfPages.map((page, index) => <PdfPage key={`${tabIndex}-${index}`} pdfPage={page} />)
      : <PlainTextContainer theme={theme}>Loading...</PlainTextContainer>;

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
      <PdfContainer theme={theme} key={tabIndex}>
        {pdfPageComponents}
      </PdfContainer>

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