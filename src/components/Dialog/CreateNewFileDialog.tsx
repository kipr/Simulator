import * as React from 'react';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import Form from '../interface/Form';
import axios from 'axios';
import ProgrammingLanguage from '../../programming/compiler/ProgrammingLanguage';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import { FontAwesome } from '../FontAwesome';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import { State as ReduxState } from '../../state';
import { I18nAction } from '../../state/reducer';
import { connect } from 'react-redux';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { AsyncProject, Project } from '../../state/State/Project';

export interface CreateNewFileDialogPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
  onCloseCreateNewFileDialog: (newFileName: string) => void;
  fileType: 'src' | 'include' | 'userData';
}

interface CreateNewFileDialogPrivateProps {
  locale: LocalizedString.Language;
  selectedProject: Project | null;
}

interface CreateNewFileDialogState {
  errorMessage: string;
}

type Props = CreateNewFileDialogPublicProps & CreateNewFileDialogPrivateProps;
type State = CreateNewFileDialogState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  color: props.theme.color,
  minHeight: '200px',
}));

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));

const ErrorMessageContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: 'red',
  color: 'white',
  height: '40px',
  alignItems: 'center',
  marginTop: '10px',
}));

const ItemIcon = styled(FontAwesome, {
  paddingLeft: '10px',
  paddingRight: '10px',
  alignItems: 'center',
  height: '30px'
});

const NewFileContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  minHeight: '200px',
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));


export class CreateNewFileDialog extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      errorMessage: ''
    }
  }

  private onFinalize_ = async (values: { [id: string]: string }) => {
    const { selectedProject, fileType } = this.props;
    const { fileName } = values;
    const specialCharRegex = /[^a-zA-Z0-9 _-]/;
    const isOnlySpaces = !fileName.trim(); // Check if the name is empty or only spaces
    const [name, extension] = fileName.split('.');
    //Check if file already exists
    if (selectedProject) {

      const fileExists = Object.values(selectedProject[`${fileType}Files`])
        .some(file => {
          const [name] = file.fileName.split('.');
          return name === fileName;
        });

      console.log("Checking if file exists:", fileExists);
      if (fileExists) {
        this.setState({ errorMessage: 'A file with this name already exists in the project.' });
        return;
      }

    }
    // Check if file name exceeds 50 characters
    if (fileName.length > 50) {
      this.setState({ errorMessage: 'File name cannot exceed 50 characters.' });
      return;
    }
    if (specialCharRegex.test(fileName)) {
      this.setState({ errorMessage: 'File name contains special characters. Please use only letters, numbers, underscores, and hyphens.' });
      return;
    }
    if (isOnlySpaces) {
      this.setState({ errorMessage: "File name cannot be empty or just spaces!" });
      return;
    }
    this.setState({ errorMessage: "" }); // Clear error message if input is valid
    try {

      this.props.onCloseCreateNewFileDialog(values.fileName);

    }
    catch (error) {
      console.error('Error creating new file:', error);
    }

  };
  render() {
    const { props, state } = this;
    const {
      style,
      className,
      theme,
      onClose,
      locale,

    } = props;

    const { errorMessage } = state;
    const CREATE_NEW_FILE_FORM_ITEMS: Form.Item[] = [
      Form.fileName('fileName', 'File Name')
    ];

    console.log("CreateNewFileDialog selectedProject:", props.selectedProject);
    return (
      <div>
        <Dialog
          theme={theme}
          name={LocalizedString.lookup(tr('Create New File'), locale)}
          onClose={onClose}
        >
          <NewFileContainer theme={theme} style={style} className={className}>
            {errorMessage && (
              <ErrorMessageContainer theme={theme}>
                <ItemIcon icon={faExclamationTriangle} />
                <div style={{ fontWeight: 450 }}>
                  {state.errorMessage}
                </div>

              </ErrorMessageContainer>
            )}
            <Container theme={theme} style={style} className={className}>
              <StyledForm
                theme={theme}
                onFinalize={this.onFinalize_}
                items={CREATE_NEW_FILE_FORM_ITEMS}
                finalizeText="Create"
              />
            </Container>

          </NewFileContainer>

        </Dialog>

      </div>

    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
  selectedProject: state.projects.selectedProject,
}), dispatch => ({
  onLocaleChange: (locale: LocalizedString.Language) => dispatch(I18nAction.setLocale({ locale })),

}))(CreateNewFileDialog) as React.ComponentType<CreateNewFileDialogPublicProps>;

