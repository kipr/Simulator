import { GREEN, RED, ThemeProps } from '../components/constants/theme';
import Form from '../components/interface/Form';
import * as React from 'react';
import { StyleProps } from '../util/style';
import { styled } from 'styletron-react';
// import db from '../db';
// import UserConsent from '../consent/UserConsent';
// import Selector from '../db/Selector';
import KIPR_LOGO_WHITE from '../../static/assets/KIPR-Logo-White-Text-Clear-Large.png';
import { faPaperPlane, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesome } from "../components/FontAwesome";
import Button from '../components/interface/Button';
import { GlobalWorkerOptions, PDFDocumentProxy, PDFPageProxy, getDocument } from 'pdfjs-dist';
import PdfPage from '../components/PdfPage';

// TODO: make this point to a local file that gets deployed
// TODO: centralize somewhere in the app
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

interface ParentalConsentPageProps extends ThemeProps, StyleProps {
  userId: string;
  token: string;
}

interface ParentalConsentPageState {
  pageStatus: 'loading' | 'valid' | 'invalid' | 'error';
  submitClicked: boolean;
  submitted: boolean;
  pdfBlobUrl: string;
  errorMessage: string;

  formIndex: number;
  // formValues: { [id: string]: string }[];
  formResults: { [id: string]: FormResult }[];

  pdfDocument: PDFDocumentProxy;
  pdfPages: PDFPageProxy[];
  pdfPagesEndKey: number;
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

const Card = styled('div', (props: ThemeProps & { flex?: string }) => ({
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

interface GenerateFormBody {
  program: string;
  childFullName: string;
  childDateOfBirth: string;
  childEmail: string;
  parentFullName: string;
  parentRelationship: string;
  parentEmailAddress: string;
  signature: string;
  signatureDate:string;
}

function createGenerateFormBodyFromFormResults(formResults: { [id: string]: FormResult }[]): GenerateFormBody {
  const generateFormBody: GenerateFormBody = {
    program: '',
    childFullName: '',
    childDateOfBirth: '',
    childEmail: '',
    parentFullName: '',
    parentRelationship: '',
    parentEmailAddress: '',
    signature: '',
    signatureDate: '',
  };

  for (const formResult of formResults) {
    for (const formResultKey in formResult) {
      const { value, pdfField } = formResult[formResultKey];
      if (!pdfField) {
        console.warn(`form key '${formResultKey}' does not have a corresponding PDF field, so it will be ignored`);
        continue;
      }

      if (value && pdfField in generateFormBody) {
        generateFormBody[pdfField] = value;
      } else {
        console.error('failed to set value of PDF field', pdfField);
      }
    }
  }

  return generateFormBody;
}

class ParentalConsentPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      pageStatus: 'loading',
      submitClicked: false,
      submitted: false,
      pdfBlobUrl: null,
      errorMessage: null,

      formIndex: 0,
      formResults: [],

      pdfDocument: null,
      pdfPages: [],
      pdfPagesEndKey: 0,
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      const currentParentConsent = await this.getCurrentParentConsent_();
      if (currentParentConsent === null) {
        this.setState({ pageStatus: 'invalid' });
        return;
      }

      const [childDobYear, childDobMonth, childDobDay] = currentParentConsent.userDateOfBirth.split('-');
      const childDobFormStr = ParentalConsentPage.dateToFormDateString(childDobYear, childDobMonth, childDobDay);

      const today = new Date();
      const todayFormStr = ParentalConsentPage.dateToFormDateString(today.getFullYear().toString(), (today.getMonth() + 1).toString(), today.getDate().toString());

      // The form results stored in state are post-finalization, so use form finalizers to finalize the pre-filled values
      const childDobFinalValue = ParentalConsentPage.getFormItem('child_dob').finalizer(childDobFormStr);
      const childEmailFinalValue = ParentalConsentPage.getFormItem('child_email').finalizer(currentParentConsent.userEmail);
      const dateSignedFinalValue = ParentalConsentPage.getFormItem('date_signed').finalizer(todayFormStr);

      this.setState({
        pageStatus: 'valid',
        // TODO: this is a messy way to set initial form results; ideally, form results in state should be flat (independent of the form structure)
        formResults: [
          { child_dob: childDobFinalValue, child_email: childEmailFinalValue },
          {},
          { date_signed: dateSignedFinalValue },
        ],
      });
    } catch {
      this.setState({ pageStatus: 'error' });
      return;
    }

    this.updatePdfPreview_();
  }

  // Convert a date to a string in the format 'MM/DD/YYYY', as expected in the form fields
  private static dateToFormDateString = (year: string, month: string, day: string): string => {
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  };

  private getCurrentParentConsent_: () => Promise<{ state: string, userDateOfBirth: string, userEmail: string }> = async () => {
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
    if (typeof(json) !== 'object' || !('state' in json) || !('userDateOfBirth' in json) || !('userEmail' in json)) {
      return new Error('Unexpected format of response body');
    }

    return json;
  };

  private onAdvanceForm_ = (newFormResults: { [id: string]: FormResult }) => {
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

  private updatePdfPreview_ = async () => {
    // Get new PDF from server
    const bodyForm: GenerateFormBody = createGenerateFormBodyFromFormResults(this.state.formResults);
    const formResponse = await fetch('/api/parental-consent/generate-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '1', // TODO: fill with real version number
        form: bodyForm,
      }),
    });

    if (!formResponse.ok) {
      // TODO: show error
      console.error('Failed to fetch form', formResponse.status);
    }

    const formResponseBody = await formResponse.arrayBuffer()

    const pdf = await getDocument(formResponseBody).promise;

    const pagePromises: Promise<PDFPageProxy>[] = [];
    for (let i = 1; i <= pdf.numPages; ++i) {
      pagePromises.push(pdf.getPage(i));
    }
    
    const pages = await Promise.all(pagePromises);

    this.setState({
      pdfDocument: pdf,
      pdfPages: pages,
      pdfPagesEndKey: this.state.pdfPagesEndKey + pages.length,
    });
  };

  private onSubmitClick_ = () => {
    this.setState({ submitClicked: true, errorMessage: null }, () => {
      fetch(`/api/parental-consent/${this.props.userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `ParentToken ${this.props.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '1', // TODO: fill with real version number
          form: createGenerateFormBodyFromFormResults(this.state.formResults),
        }),
      })
      .then(response => {
        switch (response.status) {
          case 200:
            this.state.pdfDocument.saveDocument()
              .then(pdfData => {
                const blob = new Blob([pdfData], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                this.setState({ submitClicked: false, submitted: true, pdfBlobUrl: blobUrl });
              })
              .catch(e => {
                // Allow the submission to succeed, but without a download link
                console.warn('Failed to save PDF document', e);
                this.setState({ submitClicked: false, submitted: true, pdfBlobUrl: null });
              });
            break;
          case 400:
            this.setState({ submitClicked: false, errorMessage: 'Something went wrong. The link may be invalid or expired.' });
            break;
          default:
            console.error('Consent request failed with status', response.status);
            this.setState({ submitClicked: false, errorMessage: 'Something went wrong. Please try again later.' });
            break;
        }
      })
      .catch(e => {
        console.error('Consent request failed with exception', e);
        this.setState({ submitClicked: false, errorMessage: 'Something went wrong. Please try again later.' });
      });

    });
  };

  private static createFormFinalizer = (pdfField: keyof(GenerateFormBody)) => {
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

  private static getFormItem = (id: string) => {
    for (const form of ParentalConsentPage.forms) {
      const result = form.find(item => item.id === id);
      if (result) {
        return result;
      }
    }

    return null;
  };

  private static readonly forms: Form.Item[][] = [
    // CHILD ACCOUNT INFO FORM
    [
      {
        id: 'child_program',
        text: 'Program',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer('program'),
      },
      {
        id: 'child_full_name',
        text: `Child's Full Name`,
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer('childFullName'),
      },
      {
        id: 'child_dob',
        text: 'Date of Birth',
        disabled: true,
        validator: Form.DATE_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer('childDateOfBirth'),
      },
      {
        id: 'child_email',
        text: 'Email Used for Sign Up',
        disabled: true,
        validator: Form.EMAIL_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer('childEmail'),
      },
    ],
    // PARENT INFO FORM
    [
      {
        id: 'parent_full_name',
        text: 'Full Name',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer('parentFullName'),
      },
      {
        id: 'parent_relationship',
        text: 'Relationship to the Child',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer('parentRelationship'),
      },
      {
        id: 'parent_email',
        text: 'Email Address',
        validator: Form.EMAIL_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer('parentEmailAddress'),
      },
    ],
    // SIGNATURE FORM
    [
      {
        id: 'signature',
        text: 'Signature of Parent/Legal Guardian',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer('signature'),
      },
      {
        id: 'date_signed',
        text: 'Date Signed',
        disabled: true,
        validator: Form.DATE_VALIDATOR,
        finalizer: ParentalConsentPage.createFormFinalizer('signatureDate'),
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
    const { pageStatus, formIndex, pdfBlobUrl, errorMessage, submitClicked, submitted, pdfPages, pdfPagesEndKey } = state;

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
              <Header theme={theme}>Parental/Guardian Consent</Header>
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
              <Header theme={theme}>Parental/Guardian Consent</Header>
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
        <PlainTextContainer theme={theme}>You will receive an email with a copy of the completed form.{pdfBlobUrl && <> You can also <Link theme={theme} href={pdfBlobUrl} download="ParentConsentForm.pdf">download it now</Link>.</>}</PlainTextContainer>
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

    const pdfPageComponents = pdfPages.map((page, index) => <PdfPage key={pdfPagesEndKey - index} pdfPage={page} pdfPageNum={index} />);

    return (
      <Container theme={theme}>
        <Card theme={theme} flex="0 1 500px">
          <Logo src={KIPR_LOGO_WHITE as string} />
          <Header theme={theme}>Parental/Guardian Consent</Header>

          {content}

          {errorMessage && <PlainTextContainer theme={theme} color={RED.standard}>{errorMessage}</PlainTextContainer>}
        </Card>
        <Card theme={theme} flex="1 1 500px" style={{ alignItems: 'center', scrollbarGutter: 'stable' }}>
          {pdfPageComponents}
        </Card>
      </Container>
    );
  }
}

export default ParentalConsentPage;