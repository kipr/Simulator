import { GREEN, ThemeProps } from '../components/constants/theme';
import Form from '../components/interface/Form';
import * as React from 'react';
import { StyleProps } from '../util/style';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { styled } from 'styletron-react';
// import db from '../db';
// import UserConsent from '../consent/UserConsent';
// import Selector from '../db/Selector';
import KIPR_LOGO_WHITE from '../../static/assets/KIPR-Logo-White-Text-Clear-Large.png';
import { faEye, faPaperPlane, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesome } from "../components/FontAwesome";
import Button from '../components/interface/Button';


// FORM FIELDS PROPERTIES
// - UI label
// - input type
// - validation logic
// - corresponding PDF form field


interface ParentalConsentPageProps extends ThemeProps, StyleProps {
  userId: string;
}

interface ParentalConsentPageState {
  submitClicked: boolean;
  pdfUri: string;
  message: string;

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
  backgroundImage: 'url(../../static/backgrounds/Triangular_Background_Compressed.png)',
  backgroundSize: 'cover',
}));

const Card = styled('div', (props: ThemeProps & { width?: string, flex: string }) => ({
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
  ':first-child': {
    marginLeft: `${props.theme.itemPadding * 2}px`,
  },
  ':last-child': {
    marginRight: `${props.theme.itemPadding * 2}px`,
  },
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

const PlainTextContainer = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
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

interface FormResult {
  value: string;
  pdfField: string;
}

class ParentalConsentPage extends React.Component<Props, State> {
  private pdfDoc: PDFDocument;

  constructor(props: Props) {
    super(props);

    this.state = {
      submitClicked: false,
      pdfUri: null,
      message: '',

      formIndex: 0,
      formResults: [],
    };
  }

  async componentDidMount(): Promise<void> {
    // const userConsent = await db.get<UserConsent>(Selector.user(this.props.userId));
    // console.log('got user consent:', userConsent);

    const url = '/static/sample-form.pdf';
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

    this.pdfDoc = await PDFDocument.load(existingPdfBytes);

    // // Output all form fields for debugging
    // console.log('fields', form.getFields().map(f => f.getName()));

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
    const src = `data:application/pdf;base64,${pdfBase64}`;

    this.setState({ pdfUri: src });
  }

  // // private handleProgramChange_: React.ChangeEventHandler<HTMLInputElement> = (event) => {
  // //   this.setState({ program: event.target.value });
  // // };

  private onAdvanceForm_ = (newFormResults: { [id: string]: FormResult }) => {
    console.log('got form values', newFormResults);
    this.setState({
      formResults: [
        ...this.state.formResults,
        newFormResults,
      ],
      formIndex: this.state.formIndex + 1,
    });
  };

  private onBackClick_ = () => {
    this.setState({
      formResults: this.state.formResults.slice(0, -1),
      formIndex: Math.max(0, this.state.formIndex - 1),
    });
  };

  private onPreviewClick_ = () => {
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
      .then(pdfBase64 => {
        const src = `data:application/pdf;base64,${pdfBase64}`;
        this.setState({ pdfUri: src });
      });
  };

  private onSubmitClick_ = () => {
    this.pdfDoc.save()
      .then(pdf => {
        this.setState({ submitClicked: true, message: 'Submitting...' }, () => {
          const consentRequest: XMLHttpRequest = new XMLHttpRequest();
          consentRequest.onload = () => {
            switch (consentRequest.status) {
              case 200:
                this.setState({ submitClicked: false, message: 'Success!' });
                break;
              case 400:
                this.setState({ submitClicked: false, message: 'Something went wrong. The link may be invalid or expired.' });
                break;
              default:
                console.error('Consent request failed with status', consentRequest.status);
                this.setState({ submitClicked: false, message: 'Something went wrong. Please try again later.' });
                break;
            }

            // // if (consentRequest.status === 200) {
            // //   this.setState({ submitClicked: false, message: 'Success!' });
            // // } else {
            // //   console.error('Consent request failed with status', consentRequest.status);
            // //   this.setState({ submitClicked: false, message: 'Error!' });
            // // }
          };

          consentRequest.onerror = (err) => {
            console.error('Consent request failed with error', err);
            this.setState({ submitClicked: false, message: 'Something went wrong. Please try again later.' });
          };

          consentRequest.open('POST', `/parental-consent/${this.props.userId}`);
          consentRequest.setRequestHeader('Content-Type', 'application/pdf');

          try {
            consentRequest.send(pdf);
          } catch (e) {
            console.error('Consent request failed with exception', e);
            this.setState({ submitClicked: false, message: 'Something went wrong. Please try again later.' });
          }
        });
      });
  };

  private createFormFinalizer = (pdfField: string) => {
    return (value: string) => ({ value, pdfField });
  };

  private readonly forms: Form.Item[][] = [
    // CHILD ACCOUNT INFO FORM
    [
      {
        id: 'child_program',
        text: 'Program',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: this.createFormFinalizer(null),
      },
      {
        id: 'child_full_name',
        text: `Child's Full Name`,
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: this.createFormFinalizer('Name of Dependent'),
      },
      {
        id: 'child_dob',
        text: 'Date of Birth',
        validator: Form.DATE_VALIDATOR,
        finalizer: this.createFormFinalizer(null),
      },
      {
        id: 'child_email',
        text: 'Email Used for Sign Up',
        validator: Form.EMAIL_VALIDATOR,
        finalizer: this.createFormFinalizer(null),
      },
    ],
    // PARENT INFO FORM
    [
      {
        id: 'parent_full_name',
        text: 'Full Name',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: this.createFormFinalizer('Name'),
      },
      {
        id: 'parent_relationship',
        text: 'Relationship to the Child',
        validator: Form.NON_EMPTY_VALIDATOR,
        finalizer: this.createFormFinalizer(null),
      },
      {
        id: 'parent_email',
        text: 'Email Address',
        validator: Form.EMAIL_VALIDATOR,
        finalizer: this.createFormFinalizer(null),
      },
    ],
  ];

  private readonly formHeaders: string[] = [
    'Account Information (for child)',
    `Parent/Legal Guardian's Information`,
  ];

  render() {
    const { props, state } = this;
    const { theme } = props;
    const { formIndex, pdfUri, message, submitClicked } = state;

    const isFirstStep = formIndex === 0;
    const isFinalStep = formIndex === this.forms.length;
    const subheaderText = isFinalStep ? 'Preview and Submit' : this.formHeaders[formIndex];

    return (
      <Container theme={theme}>
        <Card theme={theme} flex="1 1 auto" /*width="45%"*/>
          <PdfFrame theme={theme} id="pdf" src={pdfUri ?? undefined} onLoad={(e) => { console.log('finished loading iframe', e) }}></PdfFrame>
        </Card>
        <Card theme={theme} flex="0 0 500px" /*width="45%"*/>
          <Logo src={KIPR_LOGO_WHITE as string} />
          <Header theme={theme}>Parental Consent</Header>
          <PlainTextContainer theme={theme}>Your child has requested consent to use the KIPR Botball Simulator. Please review the notice and fill out the form using the fields below.</PlainTextContainer>
          <ButtonContainer theme={theme}>
            <Subheader theme={theme}>{subheaderText}</Subheader>
            <Button theme={theme} children={'Back'} disabled={isFirstStep} onClick={this.onBackClick_}></Button>
          </ButtonContainer>
          {/* <div>
            <InputLabel theme={theme} htmlFor="program">Program:</InputLabel>
            <input type="text" id="program" value={this.state.program} onChange={this.handleProgramChange_} />
          </div> */}
          {!isFinalStep && <Form
            finalizeIcon={faArrowRight}
            finalizeText='Next'
            theme={theme}
            items={this.forms[formIndex]}
            onFinalize={this.onAdvanceForm_}
          // finalizeDisabled={!allowSignIn}
          />}
          {/* <Subheader theme={theme}>Parent/Legal Guardian's Information</Subheader> */}

          {isFinalStep && <>
            <PlainTextContainer theme={theme}>You can preview the completed form before submitting it.</PlainTextContainer>
            <ButtonContainer theme={theme}>
              <FinalizeButton theme={theme} onClick={this.onPreviewClick_}>
                <FontAwesome icon={faEye} /> {'Preview'}
              </FinalizeButton>
            </ButtonContainer>
            <ButtonContainer theme={theme}>
              <FinalizeButton theme={theme} onClick={this.onSubmitClick_} disabled={submitClicked}>
                <FontAwesome icon={faPaperPlane} /> {'Submit'}
              </FinalizeButton>
            </ButtonContainer></>}

          {/* <Button theme={theme} children={<Text text='Preview' />} onClick={this.onPreviewClick_} /> */}
          {/* <Button theme={theme} children={<Text text='Submit' />} onClick={this.onSubmitClick_} /> */}
          {/* <button onClick={this.onPreviewClick_} disabled={this.state.submitClicked}>Preview</button><br /> */}
          {/* <button onClick={this.onSubmitClick_} disabled={this.state.submitClicked}>Submit</button><br /> */}
          {message}
        </Card>
      </Container>
    );
    // // return (
    // //   <>
    // //     <h1>Parental consent</h1>
    // //     <iframe id="pdf" src={this.state.pdfUri ?? undefined} width="1000px" height="500px"></iframe>
    // //     <div>
    // //       <label htmlFor="name">Name:</label>
    // //       <input type="text" id="name" value={this.state.name} onChange={this.handleNameChange_} />
    // //     </div>
    // //     <button onClick={this.onPreviewClick_} disabled={this.state.submitClicked}>Preview</button><br />
    // //     <button onClick={this.onSubmitClick_} disabled={this.state.submitClicked}>Submit</button><br />
    // //     {this.state.message}
    // //   </>
    // // );
  }
}

export default ParentalConsentPage;