interface TourDoc {
  completed: boolean;
  step?: number;       // resume point
  dismissed?: boolean; // user said “don’t show again”
  updatedAt?: string;  // ISO string
  version?: number;    // bump when tour content changes
}

// dashboard-tour, classroom-tour, limited-challenge-tour,

namespace TourDoc {

  export const DEFAULT: TourDoc = {
    completed: false,
    step: 0,
    dismissed: false,
    version: 1,
  };

  export const IDS = {
    DASHBOARD: 'dashboard-tour',
    CLASSROOM: 'classroom-tour',
    LIMITED_CHALLENGE: 'limited-challenge-tour',
    TEACHER_VIEW: 'teacher-view-tour',
    STUDENT_VIEW: 'student-view-tour',
    STUDENT_VIEW_IN_CLASSROOM: 'student-view-in-classroom-tour',
  };

  export const ALL = [
    IDS.DASHBOARD,
    IDS.CLASSROOM,
    IDS.LIMITED_CHALLENGE,
    IDS.TEACHER_VIEW,
    IDS.STUDENT_VIEW,
    IDS.STUDENT_VIEW_IN_CLASSROOM,
  ];

  export function withDefaults(doc?: Partial<TourDoc>): TourDoc {
    return {
      ...DEFAULT,
      ...doc,
    };
  }
}
export type Rect = { top: number; left: number; width: number; height: number };
export type TourPlacement = "top" | "bottom" | "left" | "right" | "auto";

export type TourStep = {
  id: string;

  /** key used by TourTarget to register elements */
  targetKey: string;

  title?: string;
  content: React.ReactNode;

  placement?: TourPlacement;
  padding?: number;

  /** If true, clicking the highlighted target advances (instead of Next button) */
  advanceOnTargetClick?: boolean;

  /** If false, overlay blocks interaction with the target (default true lets clicks pass through the hole) */
  allowTargetInteraction?: boolean;

  /** Optional per-step callbacks */
  onEnter?: () => void;
  onExit?: () => void;

  /** Optional button label overrides */
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  doneLabel?: string;

  /** Use interactive step instead of next button */
  noNextButton?: boolean;
  noBackButton?: boolean;
};

const DashboardTourSteps: TourStep[] = [
  // Tutorial Card Step
  {
    id: "tutorials",
    targetKey: "tutorial-card",
    title: "Tutorials",
    content: "New to the simulator? Take a tour to get familiar with the interface.",
    placement: "bottom",
    padding: 20
  },
  // Simulator Card Step
  {
    id: "simulator",
    targetKey: "simulator-card",
    title: "3D Simulator",
    content: "A simulator for the Botball demobot.",
    placement: "bottom",
  },
  // Classrooms Card Step
  {
    id: "classrooms",
    targetKey: "classrooms-card",
    title: "Classrooms",
    content: "See the current classrooms.",
    placement: "bottom",
  },
  // Limited Challenges Card Step
  {
    id: "limited-challenges",
    targetKey: "limited-challenges-card",
    title: "Limited Challenges",
    content: "Challenges with time limits and attempt restrictions.",
    placement: "bottom",
  },
  // Leaderboard Card Step
  {
    id: "leaderboard",
    targetKey: "leaderboard-card",
    title: "Leaderboard",
    content: "See the current challenge leaderboard.",
    placement: "bottom",
  },
  // About Card Step
  {
    id: "about",
    targetKey: "about-card",
    title: "About KIPR",
    content: "KIPR is a 501(c) 3 organization started to make the long-term educational benefits of robotics accessible to students.",
    placement: "bottom",
  }
];

const ClassroomTourSteps: TourStep[] = [
  // Classroom Dashboard Step
  {
    id: "classroom-overview",
    targetKey: "classroom-overview",
    title: "Classroom Dashboard",
    content: "This is the classroom dashboard page, where you can choose to see the classrooms you are a part of and the classrooms you own.",
    placement: "left",
    allowTargetInteraction: false
  },
  // Student View Card Step
  {
    id: "student-card",
    targetKey: "student-card",
    title: "Student View",
    content: "Use this card to switch to the student view.",
    placement: "bottom",
    allowTargetInteraction: false
  },
  // Teacher View Card Step
  {
    id: "teacher-card",
    targetKey: "teacher-card",
    title: "Teacher View",
    content: "Use this card to switch to the teacher view, where you can manage the classrooms you own.",
    placement: "bottom",
    allowTargetInteraction: false
  }
];

const TeacherViewTourSteps: TourStep[] = [
  // Teacher Dashboard Step
  {
    id: 'teacher-dashboard',
    targetKey: 'teacher-dashboard',
    title: 'Teacher Dashboard',
    content: 'This is the teacher dashboard, where you can see and manage the classrooms you own.',
    placement: 'top',
    allowTargetInteraction: true
  },
  // Select "+" Drop Down Step
  {
    id: 'create-classroom',
    targetKey: 'create-classroom-dropdown',
    title: 'How To: Create a Classroom',
    content: 'To create a classroom, select this drop down...',
    placement: 'bottom',
    noNextButton: true,
    advanceOnTargetClick: true,
  },
  // Select "Create Classroom" Button Step
  {
    id: 'create-classroom-dropdown-menu',
    targetKey: "create-classroom-dropdown-menu",
    title: 'How To: Create a Classroom Continued',
    content: '...then click this button to create a new classroom.',
    placement: 'bottom',
    allowTargetInteraction: true,
    noNextButton: true,
    advanceOnTargetClick: true,
  },
  // Create Classroom Dialog Step
  {
    id: 'create-classroom-dialog',
    targetKey: 'create-classroom-dialog',
    title: 'How To: Create a Classroom Continued',
    content: 'This is the dialog box where you can enter the details for your new classroom.',
    placement: 'top',
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // See Created Classroom Step
  {
    id: 'see-created-classroom',
    targetKey: 'see-created-classroom',
    title: 'How To: Create a Classroom Continued',
    content: 'After creating a classroom, you can see it listed on your dashboard.',
    placement: 'top',
    noNextButton: false,
    noBackButton: true,
    allowTargetInteraction: false,
  },
  // See Classroom Users Step
  {
    id: 'classroom-users',
    targetKey: 'classroom-users',
    title: 'How To: Create a Classroom Continued',
    content: 'Click on your newly created classroom to see the users.',
    placement: 'top',
    allowTargetInteraction: true,
    noNextButton: true,
    advanceOnTargetClick: true,
  },
  // See Invite Code Step
  {
    id: 'invite-code',
    targetKey: 'invite-code',
    title: 'How To: Create a Classroom Continued',
    content: 'Share the invite code with your students so they can join your classroom.',
    placement: 'top',
    allowTargetInteraction: false,
    noNextButton: false,
  }
];

const StudentViewTourSteps: TourStep[] = [
  // Student Dashboard Step
  {
    id: 'student-dashboard',
    targetKey: 'student-dashboard',
    title: 'Student Dashboard',
    content: 'This is the student dashboard, where you can see the classrooms you are a part of.',
    placement: 'top',
    allowTargetInteraction: false
  },
  // Select "Join Class" Button Step
  {
    id: 'join-classroom',
    targetKey: 'join-classroom-button',
    title: 'How To: Join a Classroom',
    content: 'To join a classroom, click this button to open the join classroom dialog.',
    placement: 'bottom',
    noNextButton: true,
    advanceOnTargetClick: true,
  },
  // Join Classroom Dialog Step
  {
    id: 'join-classroom-dialog',
    targetKey: 'join-classroom-dialog',
    title: 'How To: Join a Classroom Continued',
    content: 'This is the dialog box where you can enter the invite code to join a classroom.',
    placement: 'top',
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // See Challenge Tab View (After Joining Classroom) Step
  {
    id: 'challenge-tab-view',
    targetKey: 'challenge-tab-view',
    title: 'How To: Join a Classroom Continued',
    content: 'After joining a classroom, you can see the class\'s leaderboard listed on your dashboard.',
    placement: 'bottom',
    noNextButton: false,
    noBackButton: true,
    allowTargetInteraction: false,
  },
  // Default JBC Challenges Tab Step
  {
    id: 'default-jbc-challenges-leaderboard-tab',
    targetKey: 'default-jbc-challenges-leaderboard-tab',
    title: 'Default JBC Challenge Tab View',
    content: 'This tab contains the default JBC challenges that all classrooms have access to and are the scenes always in the 3D-Simulator.',
    placement: 'top',
    allowTargetInteraction: false,
    noNextButton: false,

  },
  // Export Button Step
  {
    id: 'export-button',
    targetKey: 'export-button',
    title: 'Exporting Your Challenge Scores',
    content: 'Click this button to export your challenge scores as a PDF file.',
    placement: 'left',
    allowTargetInteraction: false,
    noNextButton: false,
    advanceOnTargetClick: false,
  },
  // Scroll to My Scores Button Step
  {
    id: 'scroll-to-my-scores-button',
    targetKey: 'scroll-to-my-scores-button',
    title: 'Scrolling to Your Scores',
    content: 'Click this button to scroll to your scores on the leaderboard.',
    placement: 'left',
    allowTargetInteraction: false,
    noNextButton: false,
    advanceOnTargetClick: false,
  },
  // See My Badges Button Step
  {
    id: 'see-my-badges-button',
    targetKey: 'see-my-badges-button',
    title: 'Viewing Your Badges',
    content: 'Click this button to see the badges you have earned from completing challenges.',
    placement: 'right',
    allowTargetInteraction: false,
    noNextButton: false,
    advanceOnTargetClick: false,
  },
  // Limited Challenges Tab Click Step
  {
    id: 'challenge-tab-view-limited-challenges-click',
    targetKey: 'challenge-tab-view-limited-challenges-click',
    title: 'Limited Challenge Tab View',
    content: 'Select "Limited Challenges" to see any limited challenges your classroom has access to.',
    placement: 'right',
    allowTargetInteraction: true,
    noNextButton: true,
    advanceOnTargetClick: true,
  },

  // Limited Challenge Tab View Step
  {
    id: 'challenge-tab-view-limited-challenges',
    targetKey: 'challenge-tab-view-limited-challenges',
    title: 'Limited Challenge Tab View Continued',
    content: 'This tab contains any limited challenges that your classroom has access to. Limited challenges are challenges that have time limits and attempt restrictions.',
    placement: 'right',
    allowTargetInteraction: false,
    noNextButton: false,
  },

  // Classroom Extra Options Click Step
  {
    id: 'classroom-extra-options-click',
    targetKey: 'classroom-extra-options-click',
    title: 'Classroom Extra Options',
    content: 'Click this button to see extra options for the classroom such as leaving the classroom.',
    placement: 'left',
    allowTargetInteraction: true,
    noNextButton: true,
    advanceOnTargetClick: true,
  },

  // Classroom Extra Options Drop Down Step
  {
    id: 'classroom-extra-options-dropdown',
    targetKey: 'classroom-extra-options-dropdown',
    title: 'Classroom Extra Options Continued',
    content: 'This is the dropdown that show extra info and where you can select to leave the classroom.',
    placement: 'left',
    allowTargetInteraction: false,
    noNextButton: false,
  },

  // Leave Classroom Step
  {
    id: 'leave-classroom',
    targetKey: 'leave-classroom',
    title: 'Leaving a Classroom',
    content: 'Select "Leave Classroom" to leave the classroom. If you leave a classroom, your challenge scores will be saved but you will no longer be able to see the classroom or its leaderboard unless you join again.',
    placement: 'left',
    allowTargetInteraction: false,
    noNextButton: false,
    advanceOnTargetClick: false,
  }


];
const TourStepsById: Record<string, TourStep> = {};
DashboardTourSteps.forEach(step => {
  TourStepsById[step.id] = step;
});
ClassroomTourSteps.forEach(step => {
  TourStepsById[step.id] = step;
});
TeacherViewTourSteps.forEach(step => {
  TourStepsById[step.id] = step;
});
StudentViewTourSteps.forEach(step => {
  TourStepsById[step.id] = step;
});
const StudentViewInClassroomTourStep: TourStep[] =
  StudentViewTourSteps.filter(
    step =>
      step.id !== 'join-classroom-dialog' &&
      step.id !== 'join-classroom'
  );
export function getTourSteps(tourId: string): TourStep[] {
  switch (tourId) {
    case TourDoc.IDS.DASHBOARD:
      return DashboardTourSteps;
    case TourDoc.IDS.CLASSROOM:
      return ClassroomTourSteps;
    case TourDoc.IDS.TEACHER_VIEW:
      return TeacherViewTourSteps;
    case TourDoc.IDS.STUDENT_VIEW:
      return StudentViewTourSteps;
    case TourDoc.IDS.STUDENT_VIEW_IN_CLASSROOM:
      return StudentViewInClassroomTourStep;
    default:
      return [];
  }
}


export function getCurrentStep(tour: TourDoc): TourStep | null {
  if (tour.completed || tour.dismissed) {
    return null;
  }
  const steps = getTourSteps(tour.version ? tour.version.toString() : '');
  return steps[tour.step ?? 0] || null;
}

export default TourDoc;