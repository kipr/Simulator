import { GREEN, RED, ThemeProps } from '../components/constants/theme';
import Form from '../components/interface/Form';
import * as React from 'react';
import { StyleProps } from '../util/style';
import { PDFDocument } from 'pdf-lib';
import { styled } from 'styletron-react';
// import db from '../db';
// import UserConsent from '../consent/UserConsent';
// import Selector from '../db/Selector';
import KIPR_LOGO_WHITE from '../../static/assets/KIPR-Logo-White-Text-Clear-Large.png';
import { faPaperPlane, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesome } from "../components/FontAwesome";
import Button from '../components/interface/Button';

interface ParentalConsentPageProps extends ThemeProps, StyleProps {
  userId: string;
  token: string;
}

interface ParentalConsentPageState {
  pageStatus: 'loading' | 'valid' | 'invalid' | 'error';
  submitClicked: boolean;
  submitted: boolean;
  pdfUri: string;
  pdfBlobUrl: string;
  errorMessage: string;

  formIndex: number;
  // formValues: { [id: string]: string }[];
  formResults: { [id: string]: FormResult }[];
}

type Props = ParentalConsentPageProps;
type State = ParentalConsentPageState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '50px',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100vh',
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
  backgroundImage: 'url(../../static/backgrounds/Triangular_Background_Compressed.png)',
  backgroundSize: 'cover',
}));

const Card = styled('div', (props: ThemeProps & { width?: string, flex?: string }) => ({
  // width: props.width ?? '400px',
  height: '90%',
  display: 'flex',
  flexDirection: 'column',
  // alignItems: 'center',
  gap: '10px',
  flex: props.flex,
  opacity: 0.98,
  backdropFilter: 'blur(16px)',
  // paddingTop: `${props.theme.itemPadding * 2}px`,
  // paddingBottom: `${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  backgroundColor: props.theme.backgroundColor,
  borderRadius: `${props.theme.itemPadding * 2}px`,
  // overflow: 'hidden',
  overflow: 'auto',
  border: `1px solid ${props.theme.borderColor}`,
}));

const Logo = styled('img', {
  width: '150px',
  height: 'auto',
  marginTop: '16px',
  marginBottom: '16px',
  alignSelf: 'center',
});

const Header = styled('div', (props: ThemeProps) => ({
  fontSize: '1.3em',
  color: props.theme.color,
  fontWeight: 400,
  alignSelf: 'center',
  // marginLeft: `${props.theme.itemPadding * 2}px`,
  // marginBottom: `${props.theme.itemPadding * 2}px`,
}));

const Subheader = styled('div', (props: ThemeProps) => ({
  fontSize: '1.2em',
  color: props.theme.color,
  fontWeight: 400,
  // alignSelf: 'center',
  // marginLeft: `${props.theme.itemPadding * 2}px`,
  // marginBottom: `${props.theme.itemPadding * 2}px`,
}));

const PlainTextContainer = styled('div', (props: ThemeProps & { color?: string }) => ({
  color: props.color ?? props.theme.color,
  // alignSelf: 'flex-start',
  // marginLeft: `${props.theme.itemPadding * 2}px`,
  // marginBottom: `${props.theme.itemPadding * 2}px`,
}));

const InputLabel = styled('label', (props: ThemeProps) => ({
  color: props.theme.color,
  // marginLeft: `${props.theme.itemPadding}px`,
}));

const PdfFrame = styled('iframe', (props: ThemeProps) => ({
  // marginLeft: `${props.theme.itemPadding * 2}px`,
  // marginRight: `${props.theme.itemPadding * 2}px`,
  // marginBottom: `${props.theme.itemPadding * 2}px`,
  height: '100%',
  width: '100%',
  // width: `calc(100% - ${props.theme.itemPadding * 4}px)`,
}));


// TODO: shared with Form class; extract to common place?
const ButtonContainer = styled('div', (theme: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  // marginTop: `${theme.theme.itemPadding * 4}px`,
  // marginBottom: `${theme.theme.itemPadding * 2}px`,

  // TODO: added, not in Form class
  color: theme.theme.color,
  gap: `${theme.theme.itemPadding * 2}px`,
}));

const FinalizeButton = styled('div', (props: ThemeProps & { disabled?: boolean }) => ({
  flex: '1 1',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  backgroundColor: props.disabled ? GREEN.disabled : GREEN.standard,
  ':hover': props.disabled ? {} : {
    backgroundColor: GREEN.hover,
  },
  fontWeight: 400,
  fontSize: '1.1em',
  textAlign: 'center',
  cursor: props.disabled ? 'auto' : 'pointer',
}));

const Link = styled('a', (props: ThemeProps) => ({
  color: props.theme.color,
}));

interface FormResult {
  value: string;
  pdfField: string;
}

class ParentalConsentPage extends React.Component<Props, State> {
  private pdfDoc: PDFDocument;

  constructor(props: Props) {
    super(props);

    this.state = {
      pageStatus: 'loading',
      submitClicked: false,
      submitted: false,
      pdfUri: null,
      pdfBlobUrl: null,
      errorMessage: null,

      formIndex: 0,
      formResults: [],
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      const currentParentConsent = await this.getCurrentParentConsent_();
      if (currentParentConsent === null) {
        this.setState({ pageStatus: 'invalid' });
        return;
      }
  
      this.setState({ pageStatus: 'valid'});
    } catch {
      this.setState({ pageStatus: 'error' });
      return;
    }

    const url = '/static/eula/KIPR-Parental-Consent.pdf';
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

    this.pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Make all form elements read-only
    const form = this.pdfDoc.getForm();
    for (const formField of form.getFields()) {
      formField.enableReadOnly();
    }

    // TODO: not taking effect?
    const viewerPrefs = this.pdfDoc.catalog.getOrCreateViewerPreferences();
    viewerPrefs.setFitWindow(true);
    viewerPrefs.setHideToolbar(true);
    viewerPrefs.setHideMenubar(true);
    viewerPrefs.setHideWindowUI(true);

    const pdfBase64 = await this.pdfDoc.saveAsBase64();
    this.updatePdfContent_(pdfBase64);
  }

  private getCurrentParentConsent_: () => Promise<{ state: string }> = async () => {
    const response = await fetch(`/api/parental-consent/${this.props.userId}`, {
      headers: {
        'Authorization': `ParentToken ${this.props.token}`,
      },
    });

    if (response.status >= 400 && response.status < 500) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch current consent status with code {response.status}`);
    }

    const json = await response.json();
    if (typeof(json) !== 'object' || !('state' in json)) {
      return new Error('Unexpected format of response body');
    }

    return json;
  };

  private onAdvanceForm_ = (newFormResults: { [id: string]: FormResult }) => {
    console.log('got form values', newFormResults);
    const nextFormResults = [...this.state.formResults];
    nextFormResults[this.state.formIndex] = newFormResults;

    this.setState({
      formResults: nextFormResults,
      formIndex: this.state.formIndex + 1,
    }, () => {
      if (this.state.formIndex === ParentalConsentPage.forms.length) {
        this.updatePdfPreview_();
      }
    });
  };

  private onBackClick_ = () => {
    this.setState({
      formIndex: Math.max(0, this.state.formIndex - 1),
    });
  };

  private updatePdfPreview_ = () => {
    console.log('form results to preview', this.state.formResults);
    const form = this.pdfDoc.getForm();

    for (const formResults of this.state.formResults) {
      for (const formResultKey in formResults) {
        const { value, pdfField } = formResults[formResultKey];
        if (!pdfField) {
          console.warn(`form key '${formResultKey}' does not have a corresponding PDF field, so it will be ignored`);
          continue;
        }

        try {
          form.getTextField(pdfField).setText(value);
        } catch (e) {
          console.error(`failed to find or set value of PDF field '${pdfField}'`);
        }
      }
    }

    this.pdfDoc.saveAsBase64()
      .then(this.updatePdfContent_);
  };

  private updatePdfContent_ = (pdfBase64: string) => {
    const src = `data:application/pdf;base64,${pdfBase64}#toolbar=0&navpanes=0`;
    this.setState({ pdfUri: src });
  };

  private onSubmitClick_ = () => {
    this.pdfDoc.save()
      .then(pdf => {
        this.setState({ submitClicked: true, errorMessage: null, }, () => {
          const consentRequest: XMLHttpRequest = new XMLHttpRequest();
          consentRequest.onload = () => {
            switch (consentRequest.status) {
              case 200:
                const blob = new Blob([pdf], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                this.setState({ submitClicked: false, submitted: true, pdfBlobUrl: blobUrl });
                break;
              case 400:
                this.setState({ submitClicked: false, errorMessage: 'Something went wrong. The link may be invalid or expired.' });
                break;
              default:
                console.error('Consent request failed with status', consentRequest.status);
                this.setState({ submitClicked: false, errorMessage: 'Something went wrong. Please try again later.' });
                break;
            }
          };

          consentRequest.onerror = (err) => {
            console.error('Consent request failed with error', err);
            this.setState({ submitClicked: false, errorMessage: 'Something went wrong. Please try again later.' });
          };

          consentRequest.open('PATCH', `/api/parental-consent/${this.props.userId}`);
          consentRequest.setRequestHeader('Authorization', `ParentToken ${this.props.token}`);
          consentRequest.setRequestHeader('Content-Type', 'application/pdf');

          try {
            consentRequest.send(pdf);
          } catch (e) {
            console.error('Consent request failed with exception', e);
            this.setState({ submitClicked: false, errorMessage: 'Something went wrong. Please try again later.' });
          }
        });
      });
  };

  private static createFormFinalizer = (pdfField: string) => {
    return (value: string) => ({ value, pdfField });
  };

  private createForms: () => Form.Item[][] = () => {
    const forms: Form.Item[][] = [];
    for (let formIndex = 0; formIndex < ParentalConsentPage.forms.length; ++formIndex) {
      const form: Form.Item[] = [];
      for (const formItem of ParentalConsentPage.forms[formIndex]) {
        // Fill default values of form items with existing form results
        form.push({
          ...formItem,
          defaultValue: this.state.formResults[formIndex]?.[formItem.id]?.value,
        });
      }

      forms.push(form);
    }

    return forms;
  };

  private static readonly forms: Form.Item[][] = [
    // CHILD ACCOUNT INFO FORM
    [
      {
        id: 'child_program',
        text: 'Program',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer(`Program`),
      },
      {
        id: 'child_full_name',
        text: `Child's Full Name`,
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer(`Child's Full Name`),
      },
      {
        id: 'child_dob',
        text: 'Date of Birth',
        validator: Form.DATE_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer(`Date of Birth`),
      },
      {
        id: 'child_email',
        text: 'Email Used for Sign Up',
        validator: Form.EMAIL_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer(`Email Used for Sign Up`),
      },
    ],
    // PARENT INFO FORM
    [
      {
        id: 'parent_full_name',
        text: 'Full Name',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer(`Full Name`),
      },
      {
        id: 'parent_relationship',
        text: 'Relationship to the Child',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer(`Relationship to the Child`),
      },
      {
        id: 'parent_email',
        text: 'Email Address',
        validator: Form.EMAIL_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer(`Email Address`),
      },
    ],
    // SIGNATURE FORM
    [
      {
        id: 'signature',
        text: 'Signature of Parent/Legal Guardian',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer(`Parent/Legal Guardian Signature`),
      },
      {
        // TODO: validate that date entered is today's date
        id: 'date_signed',
        text: 'Date Signed',
        validator: Form.DATE_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer(`Date Signed`),
      },
    ],
  ];

  private readonly formHeaders: string[] = [
    'Account Information (for child)',
    `Parent/Legal Guardian's Information`,
    'Signature',
  ];

  render() {
    const { props, state } = this;
    const { theme } = props;
    const { pageStatus, formIndex, pdfUri, pdfBlobUrl, errorMessage, submitClicked, submitted } = state;

    switch (pageStatus) {
      case 'loading':
        // TODO: Ideally show the <Loading> component. However, it currently depends on the Redux store, which is a heavy dependency for this page.
        // After the store dependencies are removed/lightened, add the <Loading> component here.
        return (
          <Container theme={theme}>
          </Container>
        );
      case 'invalid':
        return (
          <Container theme={theme}>
            <Card theme={theme}>
              <Logo src={KIPR_LOGO_WHITE as string} />
              <Header theme={theme}>Parental Consent</Header>
              <PlainTextContainer theme={theme}>This link is invalid or expired. The student can restart the process by creating a new account and requesting consent again.</PlainTextContainer>
              <PlainTextContainer theme={theme}>See the <Link theme={theme} href="/static/eula/KIPR-FAQs-for-Parents.pdf" target="_blank">FAQs for Parents</Link> for more details.</PlainTextContainer>
            </Card>
          </Container>
        );
      case 'error':
        return (
          <Container theme={theme}>
            <Card theme={theme}>
              <Logo src={KIPR_LOGO_WHITE as string} />
              <Header theme={theme}>Parental Consent</Header>
              <PlainTextContainer theme={theme}>Something went wrong. Please try again later.</PlainTextContainer>
            </Card>
          </Container>
        );
    }

    const isFirstStep = formIndex === 0;
    const isFinalStep = formIndex === ParentalConsentPage.forms.length;
    const subheaderText = isFinalStep ? 'Preview and Submit' : this.formHeaders[formIndex];

    let content: JSX.Element;
    if (submitted) {
      content = <>
        <PlainTextContainer theme={theme}>Consent submitted successfully. Your child can now access the KIPR Botball Simulator.</PlainTextContainer>
        <PlainTextContainer theme={theme}>You will receive an email with a copy of the completed form. You can also <Link theme={theme} href={pdfBlobUrl} download="ParentConsentForm.pdf">download it now</Link>.</PlainTextContainer>
      </>;
    } else {
      const headerContent = <>
        <PlainTextContainer theme={theme}>Your child has requested consent to use the KIPR Botball Simulator. Please review the notice and fill out the form using the fields below.</PlainTextContainer>
        <PlainTextContainer theme={theme}>You can also view the <Link theme={theme} href="/static/eula/KIPR-FAQs-for-Parents.pdf" target="_blank">FAQs for Parents</Link>.</PlainTextContainer>
        <hr />
        <ButtonContainer theme={theme}>
          <Subheader theme={theme}>{subheaderText}</Subheader>
          <Button theme={theme} children={'Back'} disabled={isFirstStep} onClick={this.onBackClick_}></Button>
        </ButtonContainer>
      </>;

      if (isFinalStep) {
        const submitIcon = submitClicked ? faSpinner : faPaperPlane;
        const submitText = submitClicked ? 'Submitting...' : 'Submit';
        content = <>
          {headerContent}
          <PlainTextContainer theme={theme}>You can preview the completed form before submitting it.</PlainTextContainer>
          <ButtonContainer theme={theme}>
            <FinalizeButton theme={theme} onClick={this.onSubmitClick_} disabled={submitClicked}>
              <FontAwesome icon={submitIcon} /> {submitText}
            </FinalizeButton>
          </ButtonContainer>
        </>;
      } else {
        content = <>
          {headerContent}
          <Form
            finalizeIcon={faArrowRight}
            finalizeText='Next'
            theme={theme}
            items={this.createForms()[formIndex]}
            onFinalize={this.onAdvanceForm_}
            key={formIndex}
          />
        </>;
      }
    }

    return (
      <Container theme={theme}>
        <Card theme={theme} flex="0 1 500px">
          <Logo src={KIPR_LOGO_WHITE as string} />
          <Header theme={theme}>Parental Consent</Header>

          {content}

          {errorMessage && <PlainTextContainer theme={theme} color={RED.standard}>{errorMessage}</PlainTextContainer>}
        </Card>
        <Card theme={theme} flex="1 1 500px">
          <PdfFrame theme={theme} id="pdf" src={pdfUri ?? undefined} onLoad={(e) => { console.log('finished loading iframe', e) }}></PdfFrame>
        </Card>
      </Container>
    );
  }
}

export default ParentalConsentPage;