
import { Theme, ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import tr from '@i18n';
import { faPlus, faEllipsisVertical, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { State } from '../../state';
import { connect } from 'react-redux';
import { FontAwesome } from '../FontAwesome';
import { AsyncClassroom, Classroom, ClassroomAssignment } from '../../state/State/Classroom';
import SeeAssignedToDialog from '../Dialog/SeeAssignedToDialog';
import { DeleteDialog } from '../Dialog';
import { ClassroomsAction, getGradebook } from '../../state/reducer/classrooms';
import AssignmentDetailsDialog from '../Dialog/AssignmentDetailsDialog';
import db from '../../db';
import TourTarget from '../Tours/TourTarget';
import { TourRegistry } from '../../tours/TourRegistry';
import { countCompletedAssignmentChallenges } from '../../util/challengeCompletionStatus';
import { useEffect, useLayoutEffect, useState } from 'react';
import ScrollArea from '../interface/ScrollArea';
import Async from 'state/State/Async';
import Dict from 'util/objectOps/Dict';
import { assignmentIsAssignedToUser } from '../../util/studentAssignmentVisibility';
import { useTeacherViewOverlayEffect } from './TeacherViewOverlayContext';

const TEACHER_TOUR_ASSIGNMENT_ROW_STEP_IDS = new Set([
  'teacher-assignment-in-class-list',
  'teacher-assignment-select-row',
  'teacher-assignment-see-assigned-challenges',
  'teacher-assignment-go-to-challenge',
]);

/** Tour steps where the spotlight is on the assignment row (not the link or dialog). */
const TEACHER_TOUR_ROW_SPOTLIGHT_STEP_IDS = new Set([
  'teacher-assignment-in-class-list',
  'teacher-assignment-select-row',
]);

export interface AssignmentsViewPublicProps extends ThemeProps, StyleProps {
  currentSelectedClassroom: AsyncClassroom | null;
  onAssignmentAction: (currentSelectedClassroom: AsyncClassroom, action: 'edit' | 'create', assingmentToEdit?: ClassroomAssignment) => void;
  contextMenuVisible: boolean;
  config?: 'Student' | 'Teacher';
  containerRef: React.RefObject<HTMLDivElement> | undefined;
  setContextMenuVisible: React.Dispatch<React.SetStateAction<{ visible: boolean; x: number; y: number }>>;
  tourRegistry?: TourRegistry;
  tourAutoOpenAssignmentDetails?: boolean;
  /** When true, expand every subject block so the first assignment row stays in the DOM for the tour. */
  tourExpandAssignmentTopics?: boolean;
  /** Guided-tour step id so the details dialog remounts per substep and reopens after Back. */
  tourAssignmentDetailsStepId?: string;
  /** Guided-tour step index; bumps on every step so backing into assignment-details reopens the dialog. */
  tourGuidedStepIndex?: number;
  /** Teacher guided tour: current step id (e.g. list highlight after publish). */
  activeTourStepId?: string;
  /** Teacher tour: prefer spotlighting this assignment title in the list step. */
  tourHighlightAssignmentTitle?: string;
}

export interface AssignmentsViewPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
  onDeleteAssignment: (classroom: Classroom, assignmentDocId: string) => void;
}

type Props = AssignmentsViewPublicProps & AssignmentsViewPrivateProps;


const Container = styled('div', ({ $theme }: { $theme: Theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: $theme.color,
  backgroundColor: $theme.backgroundColor,
  // minHeight: '100vh',
}));

const Button = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  backgroundColor: '#2c2c2cff',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  // opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const AssignmentsListContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  borderColor: props.theme.borderColor,
  borderWidth: '4px',
  borderStyle: 'solid',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  padding: '8px',
  margin: '8px',
  backgroundColor: 'lightpurple',
  height: '100%',
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
}));

const SubjectContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'lightpurple',
  // width: '100%'

}));

const SubjectHeaderBar = styled('div', (props: ThemeProps) => ({
  fontSize: '1.5em',
  fontWeight: 'bold',
  marginBottom: '8px',
  borderBottom: `2px solid ${props.theme.borderColor}`,
  padding: '0.35em 1em',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0.5em',
  cursor: 'pointer',
  userSelect: 'none',
  ':hover': {
    backgroundColor: props.theme.hoverFileBackground,
  },
}));

const AssignmentRow = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: '8px',
  borderBottom: `2px solid ${props.theme.borderColor}`,
  alignItems: 'center',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverFileBackground
  },

}));

const AssignmentInfoBlurb = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px',
  borderBottom: `2px solid ${props.theme.borderColor}`,
  gap: '4px',


}));


const ContextMenu = styled('div', (props: ThemeProps & { x: number; y: number }) => ({
  position: "fixed",
  left: `${props.x}px`,
  top: `${props.y}px`,
  background: props.theme.contextMenuBackground,
  border: `2px solid ${props.theme.borderColor}`,
  borderRadius: "4px",
  boxShadow: "0px 4px 6px hsla(0, 0.00%, 0.00%, 0.10)",
  zIndex: 1000,
}));

const ContextMenuItem = styled('div', (props: ThemeProps) => ({
  listStyle: "none",
  padding: "10px",
  color: props.theme.color,
  margin: 0,
  cursor: "pointer",
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `${props.theme.hoverFileBackground}`
  },
}));

const Icon = styled(FontAwesome, {
  paddingRight: "5px",
  height: "1.5em",
});

const BlurbClickText = styled('div', (props: ThemeProps) => ({
  color: '#7676ff',
  fontStyle: 'italic',
  fontSize: '0.9em',
  marginLeft: '1em',
  ':hover': {
    cursor: 'pointer',

  },
}));

function readCurrentUserFromDb(): { id: string; displayName: string } {
  let user: { id: string; displayName: string } = { id: '', displayName: '' };
  const tokenManager = db.tokenManager;
  if (tokenManager) {
    const auth_ = tokenManager.auth();
    const currentUserAuth_ = auth_.currentUser;
    user = {
      id: currentUserAuth_.uid,
      displayName: currentUserAuth_.displayName || ''
    };
  }
  return user;
}

const AssignmentsView = ({
  theme,
  locale,
  currentSelectedClassroom,
  onAssignmentAction,
  setContextMenuVisible,
  contextMenuVisible,
  containerRef,
  onDeleteAssignment,
  config,
  tourRegistry,
  tourAutoOpenAssignmentDetails,
  tourExpandAssignmentTopics,
  tourAssignmentDetailsStepId,
  tourGuidedStepIndex,
  activeTourStepId,
  tourHighlightAssignmentTitle,
}: Props) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [selectedAssignment, setSelectedAssignment] = useState<ClassroomAssignment | null>(null);
  const [assignmentInfoBlurbVisible, setAssignmentInfoBlurbVisible] = useState(false);
  const [assignedChallengesDialogVisible, setAssignedChallengesDialogVisible] = useState(false);
  const [assignedStudentsDialogVisible, setAssignedStudentsDialogVisible] = useState(false);
  const [deleteAssignmentDialogVisible, setDeleteAssignmentDialogVisible] = useState(false);
  const [currentUser] = useState(readCurrentUserFromDb);
  const [studentChallengeProgressByScene, setStudentChallengeProgressByScene] = useState<Dict<unknown> | null>(null);
  /** Topic / subject section titles the user has collapsed (all start expanded). */
  const [collapsedTopics, setCollapsedTopics] = useState<Set<string>>(() => new Set());

  useTeacherViewOverlayEffect(
    (config ?? 'Student') === 'Teacher' &&
    (assignedChallengesDialogVisible || assignedStudentsDialogVisible || deleteAssignmentDialogVisible),
  );

  const loadedClassroomForProgress = Async.latestValue(currentSelectedClassroom);

  useEffect(() => {
    if (config !== 'Student') {
      setStudentChallengeProgressByScene(null);
      return;
    }
    const docId = loadedClassroomForProgress?.docId;
    const uid = currentUser.id;
    if (!docId || !uid) {
      setStudentChallengeProgressByScene(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const gradebook = await getGradebook(docId);
        if (cancelled) return;
        const mine = gradebook[uid] as Dict<unknown> | undefined;
        setStudentChallengeProgressByScene(mine ?? null);
      } catch {
        if (!cancelled) setStudentChallengeProgressByScene(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [config, loadedClassroomForProgress?.docId, currentUser.id]);

  React.useEffect(() => {
    if (tourExpandAssignmentTopics) {
      setCollapsedTopics(new Set());
    }
  }, [tourExpandAssignmentTopics]);

  const teacherAssignmentsListHighlight = React.useMemo(() => {
    if (config !== 'Teacher' || !tourRegistry || !activeTourStepId || !TEACHER_TOUR_ASSIGNMENT_ROW_STEP_IDS.has(activeTourStepId)) {
      return null;
    }
    const loaded = Async.latestValue(currentSelectedClassroom);
    const raw = loaded?.classroomAssignments;
    if (!raw) return null;
    const all = Object.values(raw);
    if (all.length === 0) return null;
    const pref = tourHighlightAssignmentTitle?.trim();
    if (pref) {
      const byTitle = all.find(a => a.title === pref);
      if (byTitle) return byTitle;
    }
    return [...all].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    })[0];
  }, [config, tourRegistry, activeTourStepId, tourHighlightAssignmentTitle, currentSelectedClassroom]);

  React.useLayoutEffect(() => {
    if (!assignedChallengesDialogVisible || !tourRegistry) return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [assignedChallengesDialogVisible, activeTourStepId, tourRegistry]);

  React.useLayoutEffect(() => {
    if (!teacherAssignmentsListHighlight) return;
    const topic = teacherAssignmentsListHighlight.topic || 'No Subject';
    setCollapsedTopics(prev => {
      if (!prev.has(topic)) return prev;
      const next = new Set(prev);
      next.delete(topic);
      return next;
    });
  }, [teacherAssignmentsListHighlight]);

  const studentTourDetailsAutoOpenAssignment = React.useMemo(() => {
    if (config !== 'Student' || !loadedClassroomForProgress) return null;
    const loaded = loadedClassroomForProgress;
    if (!loaded?.classroomAssignments) return null;
    const byId = loaded.classroomAssignments as unknown as Dict<ClassroomAssignment>;
    const grouped: Record<string, ClassroomAssignment[]> = {};
    for (const assignment of Object.values(byId)) {
      if (!assignmentIsAssignedToUser(loaded, assignment, currentUser.id)) continue;
      const topic: string = assignment.topic || 'No Subject';
      if (!grouped[topic]) grouped[topic] = [];
      grouped[topic].push(assignment);
    }
    const topicNames = Object.keys(grouped).sort((a, b) => {
      if (a === 'No Subject') return -1;
      if (b === 'No Subject') return 1;
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
    let firstListed: ClassroomAssignment | null = null;
    for (const topic of topicNames) {
      const list = grouped[topic] || [];
      if (list.length > 0) {
        firstListed = list[0];
        break;
      }
    }
    for (const topic of topicNames) {
      for (const a of grouped[topic] || []) {
        if (a.challenges && Object.keys(a.challenges).length > 0) {
          return a;
        }
      }
    }
    return firstListed;
  }, [config, loadedClassroomForProgress, currentUser.id]);

  const prevTourAutoOpenRef = React.useRef<boolean | undefined>(undefined);
  /** Layout phase so the dialog mounts before paint; GuidedTour measures in rAF after cDU and misses useEffect-only opens. */
  React.useLayoutEffect(() => {
    if (!tourAutoOpenAssignmentDetails || config !== 'Student') return;
    const openAs = selectedAssignment ?? studentTourDetailsAutoOpenAssignment;
    if (!openAs) return;
    setSelectedAssignment(openAs);
    setAssignmentInfoBlurbVisible(true);
    setAssignedChallengesDialogVisible(true);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [tourAutoOpenAssignmentDetails, tourAssignmentDetailsStepId, tourGuidedStepIndex, config, studentTourDetailsAutoOpenAssignment, selectedAssignment]);

  React.useLayoutEffect(() => {
    if (prevTourAutoOpenRef.current && !tourAutoOpenAssignmentDetails) {
      setAssignedChallengesDialogVisible(false);
    }
    prevTourAutoOpenRef.current = tourAutoOpenAssignmentDetails;
  }, [tourAutoOpenAssignmentDetails]);

  function renderAssignmentInfoBlurb(assignment: ClassroomAssignment) {

    const blurb = (
      <AssignmentInfoBlurb theme={theme}>
        {assignment.dueDate !== 'No Due Date'
          ? <div style={{ marginLeft: '1em' }}>{LocalizedString.lookup(tr('Posted'), locale)} {new Date(assignment.createdAt || '').toLocaleDateString(locale)}</div>
          : <div style={{ marginLeft: '1em' }} > {LocalizedString.lookup(tr('No Due Date'), locale)}</div>}

        {assignment.description && <div style={{ marginLeft: '1em' }}>{assignment.description}</div>}

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {assignment.challenges && (() => {
            const openAssignedChallenges = () => {
              setAssignedChallengesDialogVisible(true);
              if (tourRegistry) {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
                });
              }
            };
            const label = LocalizedString.lookup(tr('See Assigned Challenges'), locale);
            if (tourRegistry && config === 'Student') {
              return (
                <TourTarget registry={tourRegistry} targetKey="student-assignment-see-challenges-link">
                  <BlurbClickText theme={theme} onClick={openAssignedChallenges}>{label}</BlurbClickText>
                </TourTarget>
              );
            }
            if (tourRegistry && config === 'Teacher') {
              return (
                <TourTarget registry={tourRegistry} targetKey="teacher-assignment-see-assigned-challenges">
                  <BlurbClickText theme={theme} onClick={openAssignedChallenges}>{label}</BlurbClickText>
                </TourTarget>
              );
            }
            return (
              <BlurbClickText theme={theme} onClick={() => setAssignedChallengesDialogVisible(true)}>{label}</BlurbClickText>
            );
          })()}
          {config === 'Teacher' && assignment.assignedTo && Object.keys(assignment.assignedTo).length > 0 && (
            <BlurbClickText theme={theme} onClick={() => setAssignedStudentsDialogVisible(true)}>
              {LocalizedString.lookup(tr('See Assigned Students'), locale)}
            </BlurbClickText>
          )}
        </div>
      </AssignmentInfoBlurb>
    );

    if (config === 'Student' && tourRegistry) {
      return (
        <TourTarget registry={tourRegistry} targetKey="student-assignment-open-details-blurb" key={`${assignment.title}-info-blurb`}>
          {blurb}
        </TourTarget>
      );
    }

    return <React.Fragment key={`${assignment.title}-info-blurb`}>{blurb}</React.Fragment>;
  }


  function toggleTopicCollapsed(topicKey: string) {
    setCollapsedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicKey)) next.delete(topicKey);
      else next.add(topicKey);
      return next;
    });
  }

  function renderNoSubject(
    subject: string,
    assignments: ClassroomAssignment[],
    listTour?: { highlightFirstRow?: boolean; teacherHighlightAssignment?: ClassroomAssignment | null }
  ) {
    const loadedClassroom = Async.latestValue(currentSelectedClassroom);
    if (!loadedClassroom?.classroomAssignments) return null;
    if (assignments.length === 0) return null;

    const collapsed = collapsedTopics.has(subject);

    return (
      <SubjectContainer theme={theme}>
        <SubjectHeaderBar
          theme={theme}
          role="button"
          tabIndex={0}
          aria-expanded={!collapsed}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            toggleTopicCollapsed(subject);
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTopicCollapsed(subject);
            }
          }}
        >
          <Icon icon={collapsed ? faChevronRight : faChevronDown} style={{ height: '0.75em', width: '0.75em', flexShrink: 0 }} />
          <span>{subject}</span>
        </SubjectHeaderBar>
        {!collapsed &&
          assignments.map((assignment, rowIdx) => (
            config === 'Teacher' ? (
              <div style={{ width: '100%' }} key={`${assignment.title}-row`}>
                {(() => {
                  const th = listTour?.teacherHighlightAssignment;
                  const wrapHighlight =
                    !!tourRegistry &&
                    !!activeTourStepId &&
                    TEACHER_TOUR_ROW_SPOTLIGHT_STEP_IDS.has(activeTourStepId) &&
                    !!th &&
                    (th.docId && assignment.docId
                      ? assignment.docId === th.docId
                      : assignment.title === th.title);
                  const row = (
                    <AssignmentRow theme={theme}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setAssignmentInfoBlurbVisible(selectedAssignment !== assignment || !assignmentInfoBlurbVisible);
                        setSelectedAssignment(assignment);
                      }}>
                      <div style={{ flex: 1, fontWeight: 'bold' }}>
                        {assignment.title}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'center' }}>
                        <div >
                          {assignment.dueDate !== 'No Due Date'
                            ? `${LocalizedString.lookup(tr('Due'), locale)} ${new Date(assignment.dueDate || '').toLocaleDateString(locale)}`
                            : `${LocalizedString.lookup(tr('Posted'), locale)} ${new Date(assignment.createdAt || '').toLocaleDateString(locale)}`}
                        </div>

                        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', gap: '4px' }}>
                          <Icon style={{ height: '1em', padding: '0 0.5em' }} icon={faEllipsisVertical}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              const clickX = e.clientX;
                              const clickY = e.clientY;

                              setSelectedAssignment(assignment);
                              setContextMenuVisible({ visible: true, x: clickX, y: clickY });
                              setContextMenu({ visible: true, x: clickX, y: clickY });

                            }} />
                        </div>
                      </div>


                    </AssignmentRow>
                  );
                  return wrapHighlight ? (
                    <TourTarget registry={tourRegistry} targetKey="teacher-assignment-in-class-list" style={{ display: 'contents' }}>
                      {row}
                    </TourTarget>
                  ) : (
                    row
                  );
                })()}
                <>
                  {assignmentInfoBlurbVisible && selectedAssignment === assignment && renderAssignmentInfoBlurb(assignment)}
                </>
              </div>
            ) : (
              <div style={{ width: '100%' }} key={`${assignment.title}-${rowIdx}-row`}>
                {tourRegistry && listTour?.highlightFirstRow && rowIdx === 0 ? (
                  <TourTarget registry={tourRegistry} targetKey="student-assignment-first-row">
                    <AssignmentRow theme={theme}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setAssignmentInfoBlurbVisible(selectedAssignment !== assignment || !assignmentInfoBlurbVisible);
                        setSelectedAssignment(assignment);
                      }}>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 'bold' }}>
                          {assignment.title}
                        </div>
                        {assignment.challenges && Object.keys(assignment.challenges).length > 0 && (() => {
                          const c = countCompletedAssignmentChallenges(assignment, studentChallengeProgressByScene);
                          return (
                            <div style={{ fontSize: '0.82em', opacity: 0.85, marginTop: '2px' }}>
                              {LocalizedString.lookup(tr('Challenges completed'), locale)}
                              {': '}
                              {c.completed}/{c.total}
                            </div>
                          );
                        })()}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'center' }}>
                        <div >
                          {assignment.dueDate !== 'No Due Date'
                            ? `Due ${new Date(assignment.dueDate || '').toLocaleDateString(locale)}`
                            : `Posted ${new Date(assignment.createdAt || '').toLocaleDateString(locale)}`}
                        </div>

                      </div>


                    </AssignmentRow>
                  </TourTarget>
                ) : (
                  <AssignmentRow theme={theme}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setAssignmentInfoBlurbVisible(selectedAssignment !== assignment || !assignmentInfoBlurbVisible);
                      setSelectedAssignment(assignment);
                    }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {assignment.title}
                      </div>
                      {assignment.challenges && Object.keys(assignment.challenges).length > 0 && (() => {
                        const c = countCompletedAssignmentChallenges(assignment, studentChallengeProgressByScene);
                        return (
                          <div style={{ fontSize: '0.82em', opacity: 0.85, marginTop: '2px' }}>
                            {LocalizedString.lookup(tr('Challenges completed'), locale)}
                            {': '}
                            {c.completed}/{c.total}
                          </div>
                        );
                      })()}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'center' }}>
                      <div >
                        {assignment.dueDate !== 'No Due Date'
                          ? `Due ${new Date(assignment.dueDate || '').toLocaleDateString(locale)}`
                          : `Posted ${new Date(assignment.createdAt || '').toLocaleDateString(locale)}`}
                      </div>

                    </div>


                  </AssignmentRow>
                )}
                <>
                  {assignmentInfoBlurbVisible && selectedAssignment === assignment && renderAssignmentInfoBlurb(assignment)}
                </>
              </div>
            )
          ))}
      </SubjectContainer>
    );
  }




  function renderContextMenu(x: number, y: number) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const menuWidth = 200;
    const menuHeight = 185;

    const adjustedX = Math.min(x, viewportWidth - menuWidth);
    const adjustedY = Math.min(y, viewportHeight - (menuHeight + 50));
    return (
      <ContextMenu x={adjustedX} y={adjustedY} theme={theme}>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              onAssignmentAction(currentSelectedClassroom, 'edit', selectedAssignment);
              setContextMenuVisible({ visible: false, x: adjustedX, y: adjustedY });
            }}
          >
            {LocalizedString.lookup(tr("Edit"), locale)}
          </li>

        </ContextMenuItem>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              setContextMenuVisible({ visible: false, x: adjustedX, y: adjustedY });
              setDeleteAssignmentDialogVisible(true);
            }}
          >
            {LocalizedString.lookup(tr("Delete"), locale)}
          </li>
        </ContextMenuItem>
      </ContextMenu>
    );
  }

  const loadedClassroom = Async.latestValue(currentSelectedClassroom);
  const assignments = loadedClassroom?.classroomAssignments;
  const topics: Dict<ClassroomAssignment[]> = {};
  if (assignments) {
    for (const assignment of Object.values(assignments)) {
      if (config === 'Student' && !assignmentIsAssignedToUser(loadedClassroom, assignment, currentUser.id)) {
        continue;
      }
      const topic = assignment.topic || 'No Subject';
      if (!topics[topic]) {
        topics[topic] = [];
      }
      topics[topic].push(assignment);
    }
  }

  const topicNamesStudent = Object.keys(topics).sort((a, b) => {
    if (a === 'No Subject') return -1;
    if (b === 'No Subject') return 1;
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });
  const hasStudentAssignments =
    config === 'Student' &&
    topicNamesStudent.some(name => (topics[name] || []).length > 0);

  return (
    <Container $theme={theme}>
      {config === 'Teacher' && (() => {
        const createRow = (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', margin: '8px' }}>
            <Button theme={theme} onClick={() => onAssignmentAction(currentSelectedClassroom, 'create')}>
              <FontAwesome icon={faPlus} style={{ marginRight: '8px' }} />
              {LocalizedString.lookup(tr('Create Assignment'), locale)}
            </Button>
          </div>
        );
        return tourRegistry ? (
          <TourTarget registry={tourRegistry} targetKey="teacher-create-assignment-button" style={{ display: 'contents' }}>
            {createRow}
          </TourTarget>
        ) : (
          createRow
        );
      })()}

      <AssignmentsListContainer theme={theme}>
        {(() => {
          const scrollArea = (
            <StyledScrollArea theme={theme}>
              {config === 'Student' ? (
                tourRegistry ? (
                  <TourTarget registry={tourRegistry} targetKey="student-assignments-panel">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', padding: '8px', width: '100%' }}>
                      {!hasStudentAssignments ? (
                        tourRegistry ? (
                          <TourTarget registry={tourRegistry} targetKey="student-assignment-first-row">
                            <div style={{ padding: '1em', color: theme.color }}>
                              {LocalizedString.lookup(tr('You have no assignments in this class yet.'), locale)}
                            </div>
                          </TourTarget>
                        ) : (
                          <div style={{ padding: '1em', color: theme.color }}>
                            {LocalizedString.lookup(tr('You have no assignments in this class yet.'), locale)}
                          </div>
                        )
                      ) : (
                        (() => {
                          let passedFirstNonEmptyTopic = false;
                          return topicNamesStudent.map(topic => {
                            const list = topics[topic] || [];
                            if (list.length === 0) {
                              return <div key={`${topic}-student-block`}>{renderNoSubject(topic, list, undefined)}</div>;
                            }
                            const highlightFirstRow = !passedFirstNonEmptyTopic;
                            passedFirstNonEmptyTopic = true;
                            return (
                              <div key={`${topic}-student-block`}>
                                {renderNoSubject(topic, list, { highlightFirstRow })}
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </TourTarget>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', padding: '8px', width: '100%' }}>
                    {!hasStudentAssignments ? (
                      <div style={{ padding: '1em', color: theme.color }}>
                        {LocalizedString.lookup(tr('You have no assignments in this class yet.'), locale)}
                      </div>
                    ) : (
                      (() => {
                        let passedFirstNonEmptyTopic = false;
                        return topicNamesStudent.map(topic => {
                          const list = topics[topic] || [];
                          if (list.length === 0) {
                            return <div key={`${topic}-student-block`}>{renderNoSubject(topic, list, undefined)}</div>;
                          }
                          const highlightFirstRow = !passedFirstNonEmptyTopic;
                          passedFirstNonEmptyTopic = true;
                          return (
                            <div key={`${topic}-student-block`}>
                              {renderNoSubject(topic, list, { highlightFirstRow })}
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                )
              ) : (
                <>
                  {tourRegistry &&
                    activeTourStepId &&
                    TEACHER_TOUR_ASSIGNMENT_ROW_STEP_IDS.has(activeTourStepId) &&
                    !teacherAssignmentsListHighlight && (
                    <div style={{ padding: '12px' }}>
                      <TourTarget registry={tourRegistry} targetKey="teacher-assignment-in-class-list" style={{ display: 'contents' }}>
                        <div style={{ color: theme.color }}>
                          {LocalizedString.lookup(
                            tr('Assignments you publish will appear in the lists below, grouped by topic.'),
                            locale
                          )}
                        </div>
                      </TourTarget>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '5em', padding: '8px' }}>

                    {/* No Subject Container Column */}
                    {<div style={{ width: '50%' }}>
                      {renderNoSubject('No Subject', topics['No Subject'] || [], {
                        teacherHighlightAssignment: teacherAssignmentsListHighlight,
                      })}
                    </div>}

                    {/* Named Subject Container Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
                      {Object.keys(topics).filter(topic => topic !== 'No Subject')
                        .map(topic => (

                          <div key={`${topic}-subject-column`} style={{ marginBottom: '2em' }}>
                            {renderNoSubject(topic, topics[topic] || [], {
                              teacherHighlightAssignment: teacherAssignmentsListHighlight,
                            })}
                          </div>
                        ))}
                    </div>

                  </div>
                </>
              )}

            </StyledScrollArea>
          );
          return config === 'Teacher' && tourRegistry ? (
            <TourTarget registry={tourRegistry} targetKey="teacher-assignments-workspace" style={{ display: 'contents' }}>
              {scrollArea}
            </TourTarget>
          ) : (
            scrollArea
          );
        })()}

      </AssignmentsListContainer>
      {assignedChallengesDialogVisible && selectedAssignment && (
        <AssignmentDetailsDialog
          key={tourAssignmentDetailsStepId ? `${tourAssignmentDetailsStepId}:${selectedAssignment.docId}` : selectedAssignment.docId}
          theme={theme}
          onClose={() => setAssignedChallengesDialogVisible(false)}
          assignment={selectedAssignment}
          config={config}
          challengeProgressions={config === 'Student' ? studentChallengeProgressByScene : undefined}
          tourRegistry={tourRegistry}
        />
      )}
      {assignedStudentsDialogVisible && selectedAssignment && (
        <SeeAssignedToDialog
          theme={theme}
          onClose={() => setAssignedStudentsDialogVisible(false)}
          assignment={selectedAssignment}
        />
      )}
      {contextMenuVisible && renderContextMenu(contextMenu.x, contextMenu.y)}
      {deleteAssignmentDialogVisible && selectedAssignment && (
        <DeleteDialog
          theme={theme}
          onClose={() => setDeleteAssignmentDialogVisible(false)}
          onAccept={() => {
            setDeleteAssignmentDialogVisible(false);
            onDeleteAssignment(Async.latestValue(currentSelectedClassroom), selectedAssignment?.docId || '');

          }}
          name={tr(selectedAssignment.title)}
        />
      )}
    </Container >
  );
};

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
    classroomList: state.classrooms.entities,
    challenges: state.challenges
  };
}, (dispatch, ownProps) => ({
  onDeleteAssignment: (classroom: Classroom, assignmentDocId: string) => {
    dispatch(ClassroomsAction.deleteAssignment({ classroom, assignmentDocId }));
  }

}))(AssignmentsView) as React.ComponentType<AssignmentsViewPublicProps>; 