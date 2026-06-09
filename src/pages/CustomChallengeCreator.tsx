import * as React from 'react';
import { connect } from 'react-redux';
import { styled } from 'styletron-react';
import { DARK, ThemeProps } from '../components/constants/theme';
import MainMenu from '../components/MainMenu';
import { State as ReduxState } from '../state';
import LocalizedString from '../util/LocalizedString';
import tr from '@i18n';
import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import { Challenges } from '../state/State';
import Async from '../state/State/Async';
import Challenge, { ChallengeBrief } from '../state/State/Challenge';
import Author from '../db/Author';
import { auth } from '../firebase/firebase';
import { ChallengesAction, ScenesAction } from '../state/reducer';
import CustomChallengeEditor from '../components/CustomChallenges/CustomChallengeEditor';
import {
  createCustomChallengeTemplate,
  createSceneFromJbcSandbox,
  defaultCustomChallengeDescription,
  defaultCustomChallengeName,
  isCustomChallengeId,
  newCustomChallengeId,
} from '../util/customChallengeFactory';
import { sceneWithCustomChallenge } from '../util/customChallengeStorage';

export interface CustomChallengeCreatorPublicProps extends ThemeProps {}

interface CustomChallengeCreatorPrivateProps {
  locale: LocalizedString.Language;
  challenges: Challenges;
}

type Props = CustomChallengeCreatorPublicProps &
CustomChallengeCreatorPrivateProps &
WithNavigateProps & {
  dispatch: (action: unknown) => void;
};

interface State {
  selectedId: string | null;
}

const Page = styled('div', (props: ThemeProps) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
}));

const Body = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  flex: '1 1',
  minHeight: 0,
});

const Sidebar = styled('div', (props: ThemeProps) => ({
  width: '260px',
  borderRight: `1px solid ${props.theme.borderColor}`,
  display: 'flex',
  flexDirection: 'column',
}));

const ListButton = styled('button', (props: ThemeProps & { $selected?: boolean }) => ({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: `${props.theme.itemPadding * 2}px`,
  border: 'none',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: props.$selected ? 'rgba(255,255,255,0.1)' : 'transparent',
  color: props.theme.color,
  cursor: 'pointer',
}));

const NewButton = styled('button', (props: ThemeProps) => ({
  margin: `${props.theme.itemPadding * 2}px`,
  padding: '12px 16px',
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
}));

const Main = styled('div', {
  flex: '1 1',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
});

const EmptyPanel = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 4}px`,
  opacity: 0.8,
}));

function isUserCustomChallenge(challenge: Challenge, uid: string | undefined): boolean {
  if (!uid) return false;
  return (
    isCustomChallengeId(challenge.sceneId) &&
    challenge.author.type === Author.Type.User &&
    challenge.author.id === uid
  );
}

class CustomChallengeCreator extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { selectedId: null };
  }

  componentDidMount(): void {
    this.props.dispatch(ChallengesAction.listUserChallenges({}));
    this.props.dispatch(ScenesAction.LIST_USER_SCENES);
    this.selectChallengeFromUrl_();
  }

  componentDidUpdate(): void {
    this.selectChallengeFromUrl_();
  }

  private selectChallengeFromUrl_ = () => {
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get('challengeId');
    if (!challengeId || !isCustomChallengeId(challengeId)) return;
    if (this.state.selectedId === challengeId) return;
    this.setState({ selectedId: challengeId });
  };

  private customChallengeEntries_(): [string, Challenge][] {
    const uid = auth.currentUser?.uid;
    const entries: [string, Challenge][] = [];
    for (const [id, asyncChallenge] of Object.entries(this.props.challenges)) {
      const value = Async.latestValue(asyncChallenge);
      if (!value || !isUserCustomChallenge(value, uid)) continue;
      if (!isCustomChallengeId(id)) continue;
      entries.push([id, value]);
    }
    entries.sort((a, b) =>
      LocalizedString.lookup(a[1].name, LocalizedString.EN_US).localeCompare(
        LocalizedString.lookup(b[1].name, LocalizedString.EN_US)
      )
    );
    return entries;
  }

  private onCreateNew_ = () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const challengeId = newCustomChallengeId();
    const author = Author.user(uid);
    const name = defaultCustomChallengeName();
    const description = defaultCustomChallengeDescription();

    const challenge = createCustomChallengeTemplate(challengeId, author, name, description);
    const scene = sceneWithCustomChallenge(
      createSceneFromJbcSandbox(author, name, description),
      challenge
    );

    this.props.dispatch(
      ScenesAction.createScene({
        sceneId: challengeId,
        scene,
      })
    );
    this.props.dispatch(
      ChallengesAction.setChallengeInternal({
        challengeId,
        challenge: Async.loaded({
          brief: ChallengeBrief.fromChallenge(challenge),
          value: challenge,
        }),
      })
    );

    this.setState({ selectedId: challengeId });
  };

  render() {
    const { theme, locale } = this.props;
    const { selectedId } = this.state;
    const entries = this.customChallengeEntries_();

    return (
      <Page theme={theme}>
        <MainMenu theme={theme} />
        <Body>
          <Sidebar theme={theme}>
            <h2 style={{ padding: theme.itemPadding * 2, margin: 0 }}>
              {LocalizedString.lookup(tr('My JBC Challenges'), locale)}
            </h2>
            <NewButton theme={theme} type="button" onClick={this.onCreateNew_}>
              {LocalizedString.lookup(tr('New custom challenge'), locale)}
            </NewButton>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {entries.map(([id, challenge]) => (
                <ListButton
                  key={id}
                  theme={theme}
                  $selected={selectedId === id}
                  type="button"
                  onClick={() => this.setState({ selectedId: id })}
                >
                  {LocalizedString.lookup(challenge.name, locale)}
                </ListButton>
              ))}
            </div>
          </Sidebar>
          <Main>
            {selectedId ? (
              <CustomChallengeEditor theme={theme} challengeId={selectedId} />
            ) : (
              <EmptyPanel theme={theme}>
                <h2>{LocalizedString.lookup(tr('Custom JBC Challenge Creator'), locale)}</h2>
                <p>
                  {LocalizedString.lookup(
                    tr(
                      'Create challenges like the built-in JBC scenes: customize the JBC Sandbox world, define events in scene scripts, and set success and failure conditions that use the same grading rules as official challenges.'
                    ),
                    locale
                  )}
                </p>
                <p>
                  {LocalizedString.lookup(
                    tr('Select an existing challenge or create a new one to get started.'),
                    locale
                  )}
                </p>
              </EmptyPanel>
            )}
          </Main>
        </Body>
      </Page>
    );
  }
}

export default connect(
  (state: ReduxState) => ({
    locale: state.i18n.locale,
    challenges: state.challenges,
  }),
  dispatch => ({ dispatch })
)(withNavigate(CustomChallengeCreator)) as React.ComponentType<CustomChallengeCreatorPublicProps>;
