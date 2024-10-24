import { ThemeProps } from "../constants/theme";
import Form from "../interface/Form";
import React from "react";
import { styled } from "styletron-react";
import { StyleProps } from "util/style";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { Validators } from "../../util/Validator";

export interface DateOfBirthCardPublicProps extends ThemeProps, StyleProps {
  disable: boolean;
  onCollectedInfo: (dob: string) => void;
}

interface DateOfBirthCardPrivateProps {
}

interface DateOfBirthCardState {
}

type Props = DateOfBirthCardPublicProps & DateOfBirthCardPrivateProps;
type State = DateOfBirthCardState;

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));

const PlainTextContainer = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  alignSelf: 'flex-start',
  marginLeft: `${props.theme.itemPadding * 2}px`,
  marginBottom: `${props.theme.itemPadding * 2}px`,
}));

class DateOfBirthCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  private onContinueClicked_ = (values: { [id: string]: string }) => {
    if ('dob' in values) {
      const [mm, dd, yyyy] = values['dob'].split('/');
      const dob = `${yyyy}-${mm}-${dd}`;

      this.props.onCollectedInfo(dob);
    }
  };

  render(): React.ReactNode {
    const { props } = this;
    const { theme, disable } = props;

    const DOB_FORM_ITEMS: Form.Item[] = [
      Form.dob('dob', 'Date of birth'),
    ];

    const DOB_FORM_VERIFIERS: Form.Item[] = [
      Form.verifier('dob', 'A valid date of birth is required (MM/DD/YYYY)', Validators.Types.Date),
    ];

    return <>
      <PlainTextContainer theme={theme}>You must provide some additional info before continuing.</PlainTextContainer>

      <StyledForm
        finalizeIcon={faSignInAlt}
        finalizeText={'Continue'}
        theme={theme}
        items={DOB_FORM_ITEMS}
        verifiers={DOB_FORM_VERIFIERS}
        onFinalize={this.onContinueClicked_}
        finalizeDisabled={disable}
      />
    </>;
  }
}

export default DateOfBirthCard;