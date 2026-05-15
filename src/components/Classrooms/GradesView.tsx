
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import tr from '@i18n';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { State } from '../../state';
import { connect } from 'react-redux';
import { FontAwesome } from '../FontAwesome';
import { AsyncClassroom, Classroom, ClassroomAssignment } from '../../state/State/Classroom';
import Dict from '../../util/objectOps/Dict';
import { useEffect, useMemo, useState } from 'react';
import Async from 'state/State/Async';
import { ClassroomsAction, getGradebook } from '../../state/reducer/classrooms';
import AssignmentSubmissionDetails from '../Dialog/AssignmentSubmissionDetails';
import ChallengeCompletion from '../../state/State/ChallengeCompletion';
import Input from '../interface/Input';
import {
  assignmentCompletionVersusDueDate,
  completionDuePillStyle,
  countCompletedAssignmentChallenges,
} from '../../util/challengeCompletionStatus';
import {
  buildGradesExportCsv,
  downloadCsvFile,
  gradeExportChallengeKey,
  narrowAssignmentToChallengeKeys,
} from '../../util/exportGradesCsv';
import { nativeScrollbarChrome } from '../../util/nativeScrollbarChrome';
import { useTeacherViewOverlayEffect } from './TeacherViewOverlayContext';


export interface GradesViewPublicProps extends ThemeProps, StyleProps {
  currentSelectedClassroom: AsyncClassroom | null;
  contextMenuVisible: boolean;
  setContextMenuVisible: React.Dispatch<React.SetStateAction<{ visible: boolean; x: number; y: number }>>;
  onAssignmentAction?: (currentSelectedClassroom: AsyncClassroom, action: 'edit' | 'create', assingmentToEdit?: ClassroomAssignment) => void;
}

export interface GradesViewPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
  onGetGradebook: (classroomDocId: string) => void;
  onSetChallengePointsOverride: (payload: {
    classroom: Classroom;
    studentId: string;
    assignment: ClassroomAssignment;
    sceneId: string;
    overridePoints: number | null;
  }) => void;
}

type Props = GradesViewPublicProps & GradesViewPrivateProps;

function parseLocalDateBoundary(dateStr: string, endOfDay: boolean): number {
  const parts = dateStr.split('-').map(Number);
  const y = parts[0];
  const mo = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const dt = new Date(y, mo - 1, d);
  if (endOfDay) dt.setHours(23, 59, 59, 999);
  else dt.setHours(0, 0, 0, 0);
  return dt.getTime();
}

/** Prefer due date when set; otherwise posted (createdAt). */
function assignmentFilterTimestamp(assignment: ClassroomAssignment): number | null {
  if (assignment.dueDate && assignment.dueDate !== 'No Due Date') {
    const t = new Date(assignment.dueDate).getTime();
    if (!Number.isNaN(t)) return t;
  }
  if (assignment.createdAt) {
    const t = new Date(assignment.createdAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return null;
}

function assignmentMatchesDateFilter(
  assignment: ClassroomAssignment,
  filterFrom: string,
  filterTo: string
): boolean {
  if (!filterFrom && !filterTo) return true;
  const ts = assignmentFilterTimestamp(assignment);
  if (ts === null) return false;
  const fromMs = filterFrom ? parseLocalDateBoundary(filterFrom, false) : -Infinity;
  const toMs = filterTo ? parseLocalDateBoundary(filterTo, true) : Infinity;
  return ts >= fromMs && ts <= toMs;
}

const Container = styled('div', (props: ThemeProps) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
}));

const ScrollContainer = styled('div', () => ({
  width: '100%',
  overflow: 'auto',
  height: '80%',
  ...nativeScrollbarChrome,
}));

const Table = styled('table', () => ({
  width: '100%',
  borderCollapse: 'collapse',
  height: '100%',
  overflow: 'visible',
}));

const TableHeader = styled('th', (props: ThemeProps) => ({
  padding: '12px 16px',
  position: 'sticky',
  top: 0,
  textAlign: 'start',
  fontSize: '0.85em',
  fontWeight: 'bold',
  color: props.theme.color,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  borderRight: `1px solid ${props.theme.borderColor}`,
  backgroundColor: props.theme.backgroundColor,
}));

const TableRow = styled('tr', (props: ThemeProps & { $highlight?: boolean }) => ({
  backgroundColor: props.$highlight ? 'rgba(76, 175, 80, 0.15)' : 'transparent',
  ':hover': {
    backgroundColor: props.$highlight ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.05)',
  },
}));
const TableCell = styled('td', (props: ThemeProps) => ({
  padding: '12px 16px',
  fontSize: '0.95em',
  color: props.theme.color,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  borderRight: `1px solid ${props.theme.borderColor}`,
  textAlign: 'center'
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

const FilterBar = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const FilterLabel = styled('label', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.9em',
  color: props.theme.color,
}));

const ClearFilterButton = styled('div', (props: ThemeProps) => ({
  padding: '6px 12px',
  borderRadius: '4px',
  backgroundColor: '#2c2c2cff',
  cursor: 'pointer',
  fontSize: '0.9em',
  userSelect: 'none',
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const ExportButton = styled(ClearFilterButton, () => ({
  backgroundColor: '#2a4d2e',
  ':hover': {
    backgroundColor: 'rgba(76, 175, 80, 0.28)',
  },
}));

const ExportToolbarEnd = styled('div', () => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  marginLeft: 'auto',
}));

const ExportFiltersDetails = styled('details', (props: ThemeProps) => ({
  position: 'relative',
  color: props.theme.color,
}));

const ExportFiltersSummary = styled('summary', (props: ThemeProps) => ({
  listStyle: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  userSelect: 'none',
  fontSize: '0.9em',
  backgroundColor: '#2c2c2cff',
  border: `1px solid ${props.theme.borderColor}`,
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '::-webkit-details-marker': {
    display: 'none',
  },
}));

const ExportFiltersPanel = styled('div', (props: ThemeProps) => ({
  position: 'absolute',
  right: 0,
  top: '100%',
  marginTop: '6px',
  padding: '12px',
  minWidth: 'min(92vw, 420px)',
  maxWidth: '92vw',
  backgroundColor: props.theme.contextMenuBackground,
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '6px',
  boxShadow: '0px 4px 14px hsla(0, 0%, 0%, 0.25)',
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}));

const ExportFilterField = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '8px',
  fontSize: '0.9em',
  color: props.theme.color,
}));

const FilterHint = styled('span', (props: ThemeProps) => ({
  fontSize: '0.78em',
  opacity: 0.8,
  color: props.theme.color,
  maxWidth: '220px',
  lineHeight: 1.35,
}));

const MultiSelect = styled('select', (props: ThemeProps) => ({
  minWidth: '200px',
  maxWidth: '100%',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '4px',
  padding: '4px',
  fontSize: '0.85em',
}));

const GradesView = ({
  theme,
  locale,
  currentSelectedClassroom,
  contextMenuVisible,
  setContextMenuVisible,
  onAssignmentAction,
  onGetGradebook,
  onSetChallengePointsOverride
}: Props) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [selectedAssignment, setSelectedAssignment] = useState<ClassroomAssignment | null>(null);
  const loadedClassroom = Async.latestValue(currentSelectedClassroom);

  const [classroomAssignments, setClassroomAssignments] = useState<ClassroomAssignment[]>(
    loadedClassroom ? Object.values(loadedClassroom.classroomAssignments ?? {}) : []
  );

  const sortedStudents = useMemo(() => {
    const s = loadedClassroom?.studentIds;
    return s ? Object.values(s).sort((a, b) => a.displayName.localeCompare(b.displayName)) : [];
  }, [loadedClassroom?.studentIds]);

  const rosterStudentIdsKey = useMemo(
    () => sortedStudents.map(s => s.id).sort()
      .join(','),
    [sortedStudents]
  );

  const [seeSubmissionDialogVisible, setSeeSubmissionDialogVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Dict<Dict<ChallengeCompletion>> | null>(null);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  /** Empty = all students (export + table). */
  const [studentIdsFilter, setStudentIdsFilter] = useState<string[]>([]);
  /** Empty = all challenges (export + table). */
  const [challengeKeysFilter, setChallengeKeysFilter] = useState<string[]>([]);

  useTeacherViewOverlayEffect(seeSubmissionDialogVisible);

  useEffect(() => {
    setStudentIdsFilter([]);
    setChallengeKeysFilter([]);
  }, [loadedClassroom?.docId]);

  useEffect(() => {
    const valid = new Set(sortedStudents.map(s => s.id));
    setStudentIdsFilter(prev => prev.filter(id => valid.has(id)));
  }, [rosterStudentIdsKey, sortedStudents]);

  useEffect(() => {
    if (loadedClassroom?.classroomAssignments) {
      setClassroomAssignments(Object.values(loadedClassroom.classroomAssignments));
    } else {
      setClassroomAssignments([]);
    }
  }, [loadedClassroom]);

  const sortedAssignments = useMemo(
    () =>
      [...classroomAssignments].sort((a, b) => {
        const getTime = (dueDate?: string) => {
          if (!dueDate || dueDate === 'No Due Date') return Infinity;
          return new Date(dueDate).getTime();
        };
        return getTime(a.dueDate) - getTime(b.dueDate);
      }),
    [classroomAssignments]
  );

  const visibleAssignments = useMemo(
    () => sortedAssignments.filter(a => assignmentMatchesDateFilter(a, filterFrom, filterTo)),
    [sortedAssignments, filterFrom, filterTo]
  );

  useEffect(() => {
    const valid = new Set(
      visibleAssignments.flatMap(a =>
        Object.keys(a.challenges ?? {}).map(sid => gradeExportChallengeKey(a, sid))
      )
    );
    setChallengeKeysFilter(prev => prev.filter(k => valid.has(k)));
  }, [visibleAssignments]);

  const visibleStudents = useMemo(() => {
    if (studentIdsFilter.length === 0) return sortedStudents;
    return sortedStudents.filter(s => studentIdsFilter.includes(s.id));
  }, [sortedStudents, studentIdsFilter]);

  const displayAssignmentPairs = useMemo(
    () =>
      visibleAssignments
        .map(orig => ({
          orig,
          narrowed: narrowAssignmentToChallengeKeys(orig, challengeKeysFilter),
        }))
        .filter(
          p => p.narrowed.challenges && Object.keys(p.narrowed.challenges).length > 0
        ),
    [visibleAssignments, challengeKeysFilter]
  );

  const challengeExportOptions = useMemo(() => {
    const opts: { key: string; label: string }[] = [];
    for (const a of visibleAssignments) {
      for (const e of Object.values(a.challenges ?? {})) {
        const sid = e.challenge.sceneId;
        opts.push({
          key: gradeExportChallengeKey(a, sid),
          label: `${a.title} — ${e.challenge.name}`,
        });
      }
    }
    return opts;
  }, [visibleAssignments]);

  /** Option-list order must match `value` for reliable multi-select highlighting across browsers. */
  const studentIdsForSelect = useMemo(
    () => sortedStudents.filter(s => studentIdsFilter.includes(s.id)).map(s => s.id),
    [sortedStudents, studentIdsFilter]
  );

  const challengeKeysForSelect = useMemo(
    () => challengeExportOptions.filter(o => challengeKeysFilter.includes(o.key)).map(o => o.key),
    [challengeExportOptions, challengeKeysFilter]
  );

  const exportFiltersActive = studentIdsFilter.length > 0 || challengeKeysFilter.length > 0;

  const handleExportCsv = () => {
    if (!loadedClassroom) return;
    const csv = buildGradesExportCsv({
      classroom: loadedClassroom,
      classroomName: loadedClassroom.classroomId,
      students: sortedStudents,
      studentIdsFilter,
      assignments: visibleAssignments,
      challengeKeysFilter,
      grades,
      locale,
    });
    const safe = loadedClassroom.classroomId.replace(/[^\w\-.]+/g, '_').slice(0, 80);
    downloadCsvFile(
      `grades-${safe}-${new Date().toISOString()
        .slice(0, 16)
        .replace(/:/g, '-')}.csv`,
      csv
    );
  };

  useEffect(() => {
    const docId = loadedClassroom?.docId;
    if (!docId) {
      setGrades(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const next = await getGradebook(docId);
        if (!cancelled) setGrades(next);
      } catch {
        if (!cancelled) setGrades(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadedClassroom?.docId]);

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
            onClick={(e) => {
              e.stopPropagation();
              onAssignmentAction && onAssignmentAction(currentSelectedClassroom, 'edit', selectedAssignment);
              setContextMenu({ visible: false, x: adjustedX, y: adjustedY });
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
              setContextMenu({ visible: false, x: adjustedX, y: adjustedY });
              setContextMenuVisible({ visible: false, x: adjustedX, y: adjustedY });
            }}
          >
            {LocalizedString.lookup(tr("Delete"), locale)}
          </li>
        </ContextMenuItem>
      </ContextMenu>
    );
  }


  function renderGradeCell(
    student: { id: string; displayName: string; assignments?: Dict<ClassroomAssignment> },
    orig: ClassroomAssignment,
    narrowed: ClassroomAssignment
  ) {
    const isAssigned = !!(
      student.assignments &&
      Object.prototype.hasOwnProperty.call(student.assignments, orig.title)
    );
    const progressForStudent = grades ? grades[student.id] : null;
    const cellKey = `${student.id}-${orig.title}`;

    if (!isAssigned) {
      return (
        <TableCell key={cellKey} theme={theme}>
          —
        </TableCell>
      );
    }

    const { completed, total } = countCompletedAssignmentChallenges(narrowed, progressForStudent);
    const versusDue =
      progressForStudent ? assignmentCompletionVersusDueDate(narrowed, progressForStudent) : 'unknown';

    const progressLabel =
      total === 0 ? '—' : completed === total ? '✓' : `${completed}/${total}`;

    return (
      <TableCell key={cellKey} theme={theme}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {versusDue !== 'unknown' && (
            <span style={completionDuePillStyle[versusDue]}>
              {LocalizedString.lookup(
                versusDue === 'on-time'
                  ? tr('On time')
                  : versusDue === 'late'
                    ? tr('Late')
                    : tr('No deadline'),
                locale
              )}
            </span>
          )}
          <div
            onClick={() => {
              setSeeSubmissionDialogVisible(true);
              setSelectedStudentId(student.id);
              setSelectedAssignment(orig);
            }}
            style={{
              fontSize: '0.75em',
              color: theme.color,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {LocalizedString.lookup(tr('See Details'), locale)}
          </div>
          <span style={{ fontWeight: 700 }}>{progressLabel}</span>
        </div>
      </TableCell>
    );
  }

  function renderRow(student: { id: string; displayName: string; assignments?: Dict<ClassroomAssignment> }) {
    return (
      <TableRow key={student.id} theme={theme}>
        <TableCell theme={theme}>{student.displayName}</TableCell>
        {displayAssignmentPairs.map(({ orig, narrowed }) => renderGradeCell(student, orig, narrowed))}
      </TableRow>
    );
  }
  return (
    <Container theme={theme}>
      <FilterBar theme={theme}>
        <span style={{ fontWeight: 600 }}>
          {LocalizedString.lookup(tr('Filter by due or posted date'), locale)}
        </span>
        <FilterLabel theme={theme}>
          {LocalizedString.lookup(tr('From'), locale)}
          <Input
            type="date"
            theme={theme}
            value={filterFrom}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterFrom(e.target.value)}
          />
        </FilterLabel>
        <FilterLabel theme={theme}>
          {LocalizedString.lookup(tr('To'), locale)}
          <Input
            type="date"
            theme={theme}
            value={filterTo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterTo(e.target.value)}
          />
        </FilterLabel>
        {(filterFrom || filterTo) && (
          <ClearFilterButton theme={theme} onClick={() => { setFilterFrom(''); setFilterTo(''); }}>
            {LocalizedString.lookup(tr('Clear date filter'), locale)}
          </ClearFilterButton>
        )}
        <ExportToolbarEnd>
          <ExportFiltersDetails theme={theme}>
            <ExportFiltersSummary theme={theme}>
              {LocalizedString.lookup(tr('Export filters'), locale)}
              {exportFiltersActive ? ' *' : ''}
            </ExportFiltersSummary>
            <ExportFiltersPanel theme={theme}>
              <ExportFilterField theme={theme}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span>{LocalizedString.lookup(tr('Students'), locale)}</span>
                  <FilterHint theme={theme}>
                    {LocalizedString.lookup(
                      tr('Hold Ctrl or Cmd while clicking to select. Leave unselected to include all students.'),
                      locale
                    )}
                  </FilterHint>
                </div>
                <MultiSelect
                  theme={theme}
                  multiple
                  size={Math.min(8, Math.max(3, sortedStudents.length))}
                  value={studentIdsForSelect}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                    setStudentIdsFilter(selected);
                  }}
                >
                  {sortedStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </MultiSelect>
              </ExportFilterField>
              <ExportFilterField theme={theme}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span>{LocalizedString.lookup(tr('Challenges'), locale)}</span>
                  <FilterHint theme={theme}>
                    {LocalizedString.lookup(
                      tr('Shown for assignments in the date range. Leave unselected to include all challenges.'),
                      locale
                    )}
                  </FilterHint>
                </div>
                <MultiSelect
                  theme={theme}
                  multiple
                  size={Math.min(10, Math.max(3, challengeExportOptions.length))}
                  value={challengeKeysForSelect}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                    setChallengeKeysFilter(selected);
                  }}
                >
                  {challengeExportOptions.map(o => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </MultiSelect>
              </ExportFilterField>
              {exportFiltersActive && (
                <ClearFilterButton
                  theme={theme}
                  onClick={() => {
                    setStudentIdsFilter([]);
                    setChallengeKeysFilter([]);
                  }}
                >
                  {LocalizedString.lookup(tr('Clear student and challenge filters'), locale)}
                </ClearFilterButton>
              )}
            </ExportFiltersPanel>
          </ExportFiltersDetails>
          <ExportButton theme={theme} onClick={handleExportCsv}>
            {LocalizedString.lookup(tr('Export CSV'), locale)}
          </ExportButton>
        </ExportToolbarEnd>
      </FilterBar>
      {displayAssignmentPairs.length === 0 ? (
        <div
          style={{
            padding: '16px 12px',
            color: theme.color,
            borderBottom: `1px solid ${theme.borderColor}`,
          }}
        >
          {LocalizedString.lookup(
            tr('No assignment columns match the current date and challenge filters.'),
            locale
          )}
        </div>
      ) : (
        <ScrollContainer>
          <Table>
            <thead>
              <tr>
                <TableHeader theme={theme}>
                  {LocalizedString.lookup(tr('Student Name'), locale)}
                </TableHeader>
                {loadedClassroom &&
                  displayAssignmentPairs.map(({ orig }) => (
                    <TableHeader key={`hdr-${orig.title}`} theme={theme}>
                      <div
                        style={{
                          fontWeight: 'normal',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {orig.dueDate !== 'No Due Date'
                          ? `${LocalizedString.lookup(tr('Due'), locale)} ${new Date(orig.dueDate || '').toLocaleDateString(locale)}`
                          : LocalizedString.lookup(tr('No Due Date'), locale)}
                        <Icon
                          style={{ height: '1em', padding: '0 0.5em' }}
                          icon={faEllipsisVertical}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setSelectedAssignment(orig);
                            setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
                            setContextMenuVisible({ visible: true, x: e.clientX, y: e.clientY });
                          }}
                        />
                      </div>
                      <br />
                      {LocalizedString.lookup(tr(`${orig.title}`), locale)}
                    </TableHeader>
                  ))}
              </tr>
            </thead>
            <tbody>{visibleStudents.map(student => renderRow(student))}</tbody>
          </Table>
        </ScrollContainer>
      )}
      {contextMenuVisible && renderContextMenu(contextMenu.x, contextMenu.y)}
      {seeSubmissionDialogVisible && selectedAssignment && loadedClassroom && (
        <AssignmentSubmissionDetails
          theme={theme}
          onClose={() => setSeeSubmissionDialogVisible(false)}
          assignment={selectedAssignment}
          studentId={selectedStudentId || ''}
          challengeProgressions={grades ? grades[selectedStudentId || ''] : null}
          classroom={loadedClassroom}
          onChallengePointsOverride={(studentId, assignment, sceneId, overridePoints) =>
            onSetChallengePointsOverride({
              classroom: loadedClassroom,
              studentId,
              assignment,
              sceneId,
              overridePoints,
            })
          }
        />
      )}
    </Container>
  );
};

export default connect((state: State) => {

  return {
    locale: state.i18n.locale,
  };
}, (dispatch) => ({
  onGetGradebook: (classroomDocId: string) => dispatch(ClassroomsAction.getGradebook({ classroomDocId })),
  onSetChallengePointsOverride: (payload: {
    classroom: Classroom;
    studentId: string;
    assignment: ClassroomAssignment;
    sceneId: string;
    overridePoints: number | null;
  }) => dispatch(ClassroomsAction.setChallengePointsOverride(payload)),
}))(GradesView) as React.ComponentType<GradesViewPublicProps>;
