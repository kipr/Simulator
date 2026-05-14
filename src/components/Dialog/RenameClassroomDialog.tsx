import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import { Dialog } from './Dialog';
import { ThemeProps } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import Input from '../interface/Input';
import { Classroom } from '../../state/State/Classroom';
import { renameClassroomById } from '../../state/reducer/classrooms';

export interface RenameClassroomDialogPublicProps extends ThemeProps, StyleProps {
  classroom: Classroom;
  onClose: () => void;
  /** Called after a successful rename with the updated classroom value. */
  onRenamed: (classroom: Classroom) => void;
}

interface RenameClassroomDialogPrivateProps {
  locale: LocalizedString.Language;
}

type Props = RenameClassroomDialogPublicProps & RenameClassroomDialogPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: `${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  color: props.theme.color,
  minWidth: '280px',
}));

const Label = styled('label', (props: ThemeProps) => ({
  fontSize: '1.1em',
  fontWeight: 500,
}));

const ErrorText = styled('div', () => ({
  color: '#ff6b6b',
  fontSize: '0.95em',
}));

const ButtonRow = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '8px',
});

const Button = styled('div', (props: ThemeProps & { $primary?: boolean }) => ({
  padding: `${props.theme.itemPadding * 2}px ${props.theme.itemPadding * 3}px`,
  borderRadius: `${props.theme.itemPadding * 2}px`,
  cursor: 'pointer',
  userSelect: 'none',
  backgroundColor: props.$primary ? '#2d6a4f' : 'rgba(255,255,255,0.12)',
  ':hover': {
    backgroundColor: props.$primary ? '#40916c' : 'rgba(255,255,255,0.2)',
  },
}));

class RenameClassroomDialog extends React.PureComponent<Props, { name: string; error: string | null; saving: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: props.classroom.classroomId,
      error: null,
      saving: false,
    };
  }

  private errorMessage_(code: 'empty' | 'unchanged' | 'duplicate' | 'missing-doc' | 'save-failed'): string {
    const { locale } = this.props;
    switch (code) {
      case 'empty':
        return LocalizedString.lookup(tr('Enter a classroom name.'), locale);
      case 'duplicate':
        return LocalizedString.lookup(tr('A classroom with that name already exists.'), locale);
      case 'unchanged':
        return LocalizedString.lookup(tr('Choose a different name than the current one.'), locale);
      case 'missing-doc':
        return LocalizedString.lookup(tr('Could not rename this classroom (missing record).'), locale);
      case 'save-failed':
        return LocalizedString.lookup(tr('Could not save. Try again.'), locale);
      default:
        return LocalizedString.lookup(tr('Something went wrong.'), locale);
    }
  }

  private onSave_ = async () => {
    const { classroom, onClose, onRenamed } = this.props;
    this.setState({ error: null, saving: true });
    const result = await renameClassroomById(classroom, this.state.name);
    this.setState({ saving: false });
    if (result.ok) {
      onRenamed(result.classroom);
      onClose();
      return;
    }
    this.setState({ error: this.errorMessage_(result.error) });
  };

  render() {
    const { theme, locale, onClose, classroom } = this.props;
    const { name, error, saving } = this.state;
    const title = LocalizedString.lookup(tr('Rename classroom'), locale);
    return (
      <Dialog theme={theme} name={title} onClose={onClose}>
        <Container theme={theme}>
          <Label theme={theme} htmlFor="rename-classroom-input">
            {LocalizedString.lookup(tr('Classroom name'), locale)}
          </Label>
          <Input
            id="rename-classroom-input"
            theme={theme}
            value={name}
            onInput={(e: React.FormEvent<HTMLInputElement>) => this.setState({ name: e.currentTarget.value, error: null })}
          />
          {error ? <ErrorText>{error}</ErrorText> : null}
          <ButtonRow>
            <Button theme={theme} onClick={onClose}>
              {LocalizedString.lookup(tr('Cancel'), locale)}
            </Button>
            <Button
              theme={theme}
              $primary
              onClick={() => {
                if (!saving) void this.onSave_();
              }}
              style={{ opacity: saving ? 0.65 : 1, pointerEvents: saving ? 'none' : 'auto' }}
            >
              {saving ? LocalizedString.lookup(tr('Saving…'), locale) : LocalizedString.lookup(tr('Save'), locale)}
            </Button>
          </ButtonRow>
        </Container>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(RenameClassroomDialog) as React.ComponentType<RenameClassroomDialogPublicProps>;
