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
  } as const;

  export const ALL = [
    IDS.DASHBOARD,
    IDS.CLASSROOM,
    IDS.LIMITED_CHALLENGE,
    IDS.TEACHER_VIEW,
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
};

const DashboardTourSteps: TourStep[] = [
  //Tutorial Card Step
  {
    id: "tutorials",
    targetKey: "tutorial-card",
    title: "Tutorials",
    content: "New to the simulator? Take a tour to get familiar with the interface.",
    placement: "bottom",
    padding: 20
  },
  //Simulator Card Step
  {
    id: "simulator",
    targetKey: "simulator-card",
    title: "3D Simulator",
    content: "A simulator for the Botball demobot.",
    placement: "bottom",
  },
  //Classrooms Card Step
  {
    id: "classrooms",
    targetKey: "classrooms-card",
    title: "Classrooms",
    content: "See the current classrooms.",
    placement: "bottom",
  },
  //Limited Challenges Card Step
  {
    id: "limited-challenges",
    targetKey: "limited-challenges-card",
    title: "Limited Challenges",
    content: "Challenges with time limits and attempt restrictions.",
    placement: "bottom",
  },
  //Leaderboard Card Step
  {
    id: "leaderboard",
    targetKey: "leaderboard-card",
    title: "Leaderboard",
    content: "See the current challenge leaderboard.",
    placement: "bottom",
  },
  //About Card Step
  {
    id: "about",
    targetKey: "about-card",
    title: "About KIPR",
    content: "KIPR is a 501(c) 3 organization started to make the long-term educational benefits of robotics accessible to students.",
    placement: "bottom",
  }
]

const ClassroomTourSteps: TourStep[] = [
  {
    id: "classroom-overview",
    targetKey: "classroom-overview",
    title: "Classroom Dashboard",
    content: "This is the classroom dashboard page, where you can choose to see the classrooms you are a part of and the classrooms you own.",
    placement: "left",
  },
  {
    id: "student-card",
    targetKey: "student-card",
    title: "Student View",
    content: "Use this card to switch to the student view.",
    placement: "bottom",
  },
  {
    id: "teacher-card",
    targetKey: "teacher-card",
    title: "Teacher View",
    content: "Use this card to switch to the teacher view, where you can manage the classrooms you own.",
    placement: "bottom",
  }
]

const TeacherViewTourSteps: TourStep[] = [
  {
    id: 'teacher-dashboard',
    targetKey: 'teacher-dashboard',
    title: 'Teacher Dashboard',
    content: 'This is the teacher dashboard, where you can see and manage the classrooms you own.',
    placement: 'top',
  },
  {
    id: 'create-classroom',
    targetKey: 'create-classroom-dropdown',
    title: 'How To: Create a Classroom',
    content: 'To create a classroom, select this drop down...',
    placement: 'bottom',
    advanceOnTargetClick: true,
  },
  {
    id: 'create-classroom-2',
    targetKey: "create-classroom-dropdown-menu",
    title: 'How To: Create a Classroom Continued',
    content: '...then click this button to create a new classroom.',
    placement: 'bottom',
    allowTargetInteraction: true,
    advanceOnTargetClick: true,
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

export function getTourSteps(tourId: string): TourStep[] {
  switch (tourId) {
    case TourDoc.IDS.DASHBOARD:
      return DashboardTourSteps;
    case TourDoc.IDS.CLASSROOM:
      return ClassroomTourSteps;
    case TourDoc.IDS.TEACHER_VIEW:
      return TeacherViewTourSteps;
    default:
      return [];
  }
}

export default TourDoc;