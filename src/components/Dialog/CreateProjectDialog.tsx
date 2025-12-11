import * as React from 'react';
import { connect } from 'react-redux';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import { State as ReduxState } from '../../state';
import ComboBox from '../interface/ComboBox';
import Form from '../interface/Form';
import ProgrammingLanguage from '../../programming/compiler/ProgrammingLanguage';
import { InterfaceMode } from '../../types/interfaceModes';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import { FontAwesome } from '../FontAwesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Async from 'state/State/Async';
import { AsyncProject, Project } from 'state/State/Project';
import Dict from '../../util/objectOps/Dict';

export interface CreateProjectDialogPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
  onCreateProject: (projectName: string, language: ProgrammingLanguage, interfaceMode: InterfaceMode) => void;
}

interface CreateProjectDialogPrivateProps {
  locale: LocalizedString.Language;
  projects: Dict<Project>
  interfaceMode: InterfaceMode;
}

interface CreateProjectDialogState {
  showRepeatProjectDialog: boolean;
  language: string;
  errorMessage: string;
}

type Props = CreateProjectDialogPublicProps & CreateProjectDialogPrivateProps;
type State = CreateProjectDialogState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  color: props.theme.color,
  minHeight: '200px',
}));

const ComboBoxLabel = styled('label', (theme: ThemeProps) => ({
  display: 'block',
  color: theme.theme.color,
  fontSize: '1.1em',
  fontWeight: 'normal',
  marginTop: `${theme.theme.itemPadding * 2}px`,
  marginBottom: `${theme.theme.itemPadding}px`,
  marginRight: `${theme.theme.itemPadding}px`,
  userSelect: 'none'
}));

const ComboBoxContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  color: props.theme.color,
  spacing: '10px',
  minHeight: '30px',
  marginLeft: '8px',
  marginRight: '8px',
  marginBottom: '8px',
}));

const NewProjectContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  minHeight: '200px',
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
  paddingTop: `${props.theme.itemPadding * 2}px`,
}));

const StyledComboBox = styled(ComboBox, {
  flex: '1 0',
});

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));

const LANGUAGE_OPTIONS: ComboBox.Option[] = [{
  text: 'C',
  data: 'c'
}, {
  text: 'C++',
  data: 'cpp'
}, {
  text: 'Python',
  data: 'python'
},
{
  text: 'Graphical',
  data: 'graphical'
}
];

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

export class CreateProjectDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showRepeatProjectDialog: false,
      language: 'c',
      errorMessage: '',
    }
  }

  private onSelectLanguage_ = (languageIndex: number, option: ComboBox.Option) => {
    this.onLanguageChange(option.data as ProgrammingLanguage);
  };

  private onLanguageChange = (language: ProgrammingLanguage) => {
    this.setState({
      language: language
    });
  };

  onFinalize_ = async (values: { [id: string]: string }) => {
    const { projects, interfaceMode } = this.props;
    const projectName = values.projectName;

    const specialCharRegex = /[^a-zA-Z0-9 _-]/;
    const isOnlySpaces = !projectName.trim(); // Check if the name is empty or only spaces

    //Check if project already exists in database
    if (projects) {
      const projectExists = Object.values(projects).some(project => project.projectName === projectName);
      if (projectExists) {
        this.setState({ errorMessage: 'A project with this name already exists. Please choose a different name.' });
        return;
      }
    }
    // Check if project name exceeds 50 characters
    if (projectName.length > 50) {
      this.setState({ errorMessage: 'Project name cannot exceed 50 characters.' });
      return;
    }
    if (specialCharRegex.test(projectName)) {
      this.setState({ errorMessage: 'Project name contains special characters. Please use only letters, numbers, underscores, and hyphens.' });
      return;
    }
    if (isOnlySpaces) {
      this.setState({ errorMessage: "Project name cannot be empty or just spaces!" });
      return;
    }
    this.setState({ errorMessage: "" }); // Clear error message if input is valid
    try {
      this.props.onCreateProject(
        projectName,
        this.state.language as ProgrammingLanguage,
        interfaceMode
      );
    }
    catch (error) {
      console.error('Error adding user to database:', error);
      if (error.response.status === 409) {
        this.setState({ errorMessage: 'Project name already exists. Please choose a different name.' });
      }
    }

  };

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale } = props;
    const { errorMessage } = state;
    const CREATEPROJECT_FORM_ITEMS: Form.Item[] = [
      Form.projectName('projectName', 'Project Name')
    ];

    const languageIndex = LANGUAGE_OPTIONS.findIndex(option => option.data === this.state.language);
    return (
      <div>
        <Dialog
          theme={theme}
          name={LocalizedString.lookup(tr('Create New Project'), locale)}
          onClose={onClose}
        >
          <NewProjectContainer theme={theme} style={style} className={className}>
            <ComboBoxContainer theme={theme} style={style} className={className}>
              <ComboBoxLabel theme={theme}>Language:</ComboBoxLabel>
              <StyledComboBox
                theme={theme}
                onSelect={this.onSelectLanguage_}
                options={LANGUAGE_OPTIONS}
                index={languageIndex}
              />
            </ComboBoxContainer>

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
                items={CREATEPROJECT_FORM_ITEMS}
                finalizeText="Create"
              />
            </Container>

          </NewProjectContainer>

        </Dialog>

      </div>

    );
  }
}

export default connect((state: ReduxState) => {

  const asyncProjects = state.projects.entities;
  let currentProjects = {};
  asyncProjects && Object.values(asyncProjects).forEach(asyncProject => {
    const project = Async.latestValue(asyncProject);
    if (project) {
      currentProjects[project.projectName] = project;
    }
  });
  return {
    locale: state.i18n.locale,
    projects: currentProjects,
    interfaceMode: state.projects.interfaceMode,
  };
})(CreateProjectDialog) as React.ComponentType<CreateProjectDialogPublicProps>;
