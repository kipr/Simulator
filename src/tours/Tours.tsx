import Dict from "util/objectOps/Dict";

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
    SIMULATOR: 'simulator-tour'
  };

  export const ALL = [
    IDS.DASHBOARD,
    IDS.CLASSROOM,
    IDS.LIMITED_CHALLENGE,
    IDS.TEACHER_VIEW,
    IDS.STUDENT_VIEW,
    IDS.STUDENT_VIEW_IN_CLASSROOM,
    IDS.SIMULATOR
  ];

  export function withDefaults(doc?: Partial<TourDoc>): TourDoc {
    return {
      ...DEFAULT,
      ...doc,
    };
  }
}
export type Rect = { top: number; left: number; width: number; height?: number };
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

  subTourSteps?: Dict<TourStep[]>; // if set, shows a mini combo box to select sub-steps
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
  },
  // Retake Tour Step
  {
    id: "retake-tour",
    targetKey: "retake-tour-button",
    title: "Retake Tour",
    content: "Click here to retake the tour at any time.",
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
    allowTargetInteraction: false,
    noNextButton: false,
  },
  // Point Out Invite Code Step
  {
    id: 'create-classroom-invite-code',
    targetKey: 'create-classroom-invite-code',
    title: 'How To: Create a Classroom Continued',
    content: 'Share the Invite Code with your students! Don\'t worry, it\'ll be visible later on too. \n \n Fill out the rest of the info and click "Create" to create your classroom.',
    placement: 'right',
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
const SimEditorConsoleSteps: TourStep[] = [
  // Editor Tab Step
  {
    id: 'tab-editor',
    targetKey: 'tab-Editor',
    title: 'Editor Tab',
    content: 'This is the Editor tab where you can write, edit, and debug your code.',
    placement: 'bottom',
    allowTargetInteraction: false
  },
  // Editor and Console Overview Step
  {
    id: 'simulator-editor-console-overview',
    targetKey: 'simulator-editor-console-overview',
    title: 'Editor and Console Overview',
    content: 'The Editor tab contains 2 main sections: the code editor on top and the console on bottom.',
    placement: 'right',
    allowTargetInteraction: false
  },
  // Code Editor Step
  {
    id: 'code-editor',
    targetKey: 'code-editor',
    title: 'Code Editor',
    content: 'This is the code editor, where you can write and edit your code.',
    placement: 'right',
    allowTargetInteraction: false
  },
  // Code Editor Language Dropdown Step
  {
    id: 'code-editor-language-charm',
    targetKey: 'LanguageSelectCharm-key-0',
    title: 'Code Editor Language Dropdown',
    content: 'Click this dropdown to select the programming language for your code.',
    placement: 'bottom',
    allowTargetInteraction: false,
  },
  // Indent Button Step
  {
    id: 'code-editor-indent',
    targetKey: 'Button-key-1',
    title: 'Code Editor Indent Button',
    content: 'Click this button to auto-indent your code.',
    placement: 'bottom',
    allowTargetInteraction: false,
  },
  // Download Button Step 
  {
    id: 'code-editor-download',
    targetKey: 'Button-key-2',
    title: 'Code Editor Download Button',
    content: 'Click this button to download your code as a file.',
    placement: 'bottom',
    allowTargetInteraction: false,
  },
  // Reset Code Button Step
  {
    id: 'code-editor-reset',
    targetKey: 'Button-key-3',
    title: 'Code Editor Reset Button',
    content: 'Click this button to reset the code in the editor to the default code for the current language.',
    placement: 'bottom',
    allowTargetInteraction: false,
  },
  // Console Step
  {
    id: 'console',
    targetKey: 'console',
    title: 'Console',
    content: 'This is the console, where you can see the output of your code and any error messages.',
    placement: 'right',
    allowTargetInteraction: false
  },
  // Console Clear Button Step
  {
    id: 'console-clear-button',
    targetKey: 'console-clear-button',
    title: 'Console Clear Button',
    content: 'Click this button to clear the console.',
    placement: 'top',
    allowTargetInteraction: false,
  },
  // Ask Tutor Button Step
  {
    id: 'ask-tutor-button',
    targetKey: 'ask-tutor-button',
    title: 'Ask Tutor Button',
    content: 'Click this button to ask the KIPR Tutor for help with your code.',
    placement: 'top',
    allowTargetInteraction: false,
  }
];

const SimMainMenuSteps: TourStep[] = [
  // Main Menu Overview Step
  {
    id: 'simulator-main-menu-overview',
    targetKey: 'simulator-main-menu-overview',
    title: 'Main Menu Overview',
    content: 'This is the main menu, where you can access different pages and features of the simulator.',
    placement: 'bottom',
    allowTargetInteraction: false
  },
  // Return to Dashboard Button Step
  {
    id: 'return-to-dashboard-button',
    targetKey: 'return-to-dashboard-button',
    title: 'Return to Dashboard Button',
    content: 'Click the KIPR logo to return to the dashboard.',
    placement: 'bottom',
    allowTargetInteraction: true,
  },
  // Run/Stop Button Step
  {
    id: 'run-stop-button',
    targetKey: 'run-stop-button',
    title: 'Run/Stop Button',
    content: 'Use this button to run or stop your code in the simulator.',
    placement: 'bottom',
    allowTargetInteraction: false,
  },
  // Reset World Button Step
  {
    id: 'reset-world-button',
    targetKey: 'reset-world-button',
    title: 'Reset World Button',
    content: 'Click this button to reset the world in the simulator.',
    placement: 'bottom',
    allowTargetInteraction: false,
  },
  // Start Challenge Button Step
  {
    id: 'start-challenge-button',
    targetKey: 'start-challenge-button',
    title: 'Start Challenge Button',
    content: 'After opening a challenge scene, click this button to start the challenge.',
    placement: 'bottom',
    allowTargetInteraction: false,
  },
  // Layout Button Step
  {
    id: 'layout-button',
    targetKey: 'layout-button',
    title: 'Layout Button',
    content: 'Click this button to see options to change the layout of the simulator interface. Try it now!',
    placement: 'bottom',
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // Layout Options Step
  {
    id: 'layout-options',
    targetKey: 'layout-options',
    title: 'Layout Options',
    content: 'These are the different layout options. Select one to change the layout of the simulator interface.',
    placement: 'bottom',
    allowTargetInteraction: false
  },
  // Scene Button Step
  {
    id: 'scene-button',
    targetKey: 'scene-button',
    title: 'Scene Button',
    content: 'Click this button to see options to change the scene in the simulator. Try it now!',
    placement: 'bottom',
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // Scene Options Step
  {
    id: 'scene-options',
    targetKey: 'scene-options',
    title: 'Scene Options',
    content: 'These are the different scene options. Select one to change the scene in the simulator.',
    placement: 'bottom',
    allowTargetInteraction: false
  },
  // Scene Options Info Step
  {
    id: 'scene-options-info',
    targetKey: 'scene-options',
    title: 'Scene Options Info',
    content: 'Currently, we\'re in the JBC Sandbox so some options are locked. Select "Open" to continue.',
    placement: 'left',
    noNextButton: true
  },
  // Scene Open Step
  {
    id: 'open-scene-dialog',
    targetKey: 'open-scene-dialog',
    title: 'Scene Open',
    content: 'This is the open scene option, which allows you to open different scenes in the simulator.',
    placement: 'bottom',
    allowTargetInteraction: false,
  },
  // Open Scene Dialog List Step
  {
    id: 'open-scene-list',
    targetKey: 'open-scene-list',
    title: 'Scene Open Continued',
    content: 'This is the list of scenes that you can open. Select one to see more info and open it in the Simulator.',
    placement: 'right',
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // Open Scene Dialog Info Step
  {
    id: 'open-scene-info',
    targetKey: 'open-scene-info',
    title: 'Scene Open Continued',
    content: 'This is the info page for the scene. Click "Accept" at the bottom to open the scene in the simulator.',
    placement: 'right',
  },
  // Close Scene Dialog Step
  {
    id: 'close-scene-dialog',
    targetKey: 'Open World-dialog',
    title: 'Scene Open Continued',
    content: 'For now, let\'s close the dialog to continue exploring the simulator interface.',
    placement: 'top',
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // Extra Menu Button Step
  {
    id: 'extra-menu-button',
    targetKey: 'extra-menu-button',
    title: 'Extra Menu Button',
    content: 'Click this button to see extra options such as the simulator settings and the option to report a bug.',
    placement: 'left',
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // Extra Menu Options Step
  {
    id: 'extra-menu-options',
    targetKey: 'extra-menu-options',
    title: 'Extra Menu Options',
    content: 'These are the extra options you can access from this menu.',
    placement: 'left',
    allowTargetInteraction: false,
  },
  // Extra Menu Documentation Button Step
  {
    id: 'extra-menu-documentation-button',
    targetKey: 'extra-menu-documentation-button',
    title: 'Documentation Button',
    content: 'Click the documentation button to access the KIPR library.',
    placement: 'left',
    allowTargetInteraction: false,
  },
  // Extra Menu Ask Tutor Button Step
  {
    id: 'extra-menu-ask-tutor-button',
    targetKey: 'extra-menu-ask-tutor-button',
    title: 'Tutor Button',
    content: 'Click the ask tutor button to ask the KIPR Tutor for help with the simulator.',
    placement: 'left',
    allowTargetInteraction: false,
  },
  // Extra Menu Settings Button Step
  {
    id: 'extra-menu-settings-button',
    targetKey: 'extra-menu-settings-button',
    title: 'Settings Button',
    content: 'Click the settings button to see options such as User Interface and Editor settings.',
    placement: 'left',
    allowTargetInteraction: false,
  },
  // Extra Menu About Button Step
  {
    id: 'extra-menu-about-button',
    targetKey: 'extra-menu-about-button',
    title: 'About Button',
    content: 'Click the about button to see information about KIPR and the simulator.',
    placement: 'left',
    allowTargetInteraction: false,
  },
  // Extra Menu Feedback Button Step
  {
    id: 'extra-menu-feedback-button',
    targetKey: 'extra-menu-feedback-button',
    title: 'Feedback Button',
    content: 'Click the feedback button to report a bug or send feedback about the Simulator to KIPR.',
    placement: 'left',
    allowTargetInteraction: false,
  },
  // Extra Menu Logout Button Step
  {
    id: 'extra-menu-logout-button',
    targetKey: 'extra-menu-logout-button',
    title: 'Logout Button',
    content: 'Click the logout button to log out of your account.',
    placement: 'left',
    allowTargetInteraction: false,
  },
];

const SimLeftTabSteps: TourStep[] = [
  // Overlay Tab Bar Overview Step
  {
    id: 'simulator-left-tab-overview',
    targetKey: 'simulator-left-tab-overview',
    title: 'Overlay Tab Bar Overview',
    content: 'This is the Overlay Tab Bar, where you can access different tools and features to use while testing your code in the simulator.',
    placement: 'right',
    allowTargetInteraction: false,
  },
  // Overlay Tab Bar Overview Continued Step
  {
    id: 'simulator-left-tab-overview-continued',
    targetKey: 'tab-Robot',
    title: 'Overlay Tab Bar Overview Continued',
    content: 'We\'ve already introduced the Editor Tab, we\'ll now explore the other tabs available: Robot and World. Click the "Robot" tab to continue the tour!',
    placement: 'right',
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // Overlay Tab Bar Robot Info Step
  {
    id: 'overlay-tab-robot',
    targetKey: 'robot-overview',
    title: 'Overlay Tab Bar Robot Tab',
    content: 'This is the Robot tab, where you can see information about the robot such as its position and sensor readings.',
    placement: 'right',
    noBackButton: true,
  },
  // Overlay Tab Bar Robot Starting Location Step
  {
    id: 'robot-starting-location',
    targetKey: 'robot-starting-location',
    title: 'Robot Starting Location',
    content: 'The robot starts at the origin point in the simulator, which is why the position readings are all 0. You can change the robot\'s starting location by entering different values for x, y, z, and rotation.',
    placement: 'right',
    allowTargetInteraction: false,
  },
  // Robot Servo Section Step
  {
    id: 'robot-servos',
    targetKey: 'robot-servos',
    title: 'Robot Servos',
    content: 'This is the servo section, where you can see the current positions of the robot\'s servos. You can also click get_servo_position() row to see a graph.',
    placement: 'right',
    allowTargetInteraction: false,
  },
  // Robot Motor Velocities Section Step
  {
    id: 'robot-motor-velocities',
    targetKey: 'robot-motor-velocities',
    title: 'Robot Motor Velocities',
    content: 'This is the motor velocities section, where you can see the current velocities of the robot\'s motors. You can also click each motor row to see a graph.',
    placement: 'right',
    allowTargetInteraction: false,
  },
  // Robot Motor Positions Section Step
  {
    id: 'robot-motor-positions',
    targetKey: 'robot-motor-positions',
    title: 'Robot Motor Positions',
    content: 'This is the motor positions section, where you can see the current positions of the robot\'s motors. You can also click each get_motor_position_counter() row to see a graph.',
    placement: 'right',
    allowTargetInteraction: false,
  },
  // Robot Analog Sensors Section Step
  {
    id: 'robot-analog-sensors',
    targetKey: 'robot-analog-sensors',
    title: 'Robot Analog Sensors',
    content: 'This is the analog sensors section, where you can see the current readings of the robot\'s analog sensors. You can also click each analog() row to see a graph.',
    placement: 'right',
    allowTargetInteraction: false,
  },
  // Robot Digital Sensors Section Step
  {
    id: 'robot-digital-sensors',
    targetKey: 'robot-digital-sensors',
    title: 'Robot Digital Sensors',
    content: 'This is the digital sensors section, where you can see the current readings of the robot\'s digital sensors. You can also click each digital() row to see a graph.',
    placement: 'right',
    allowTargetInteraction: false,
  },

  // World Tab Step
  {
    id: 'overlay-tab-world',
    targetKey: 'tab-World',
    title: 'Overlay Tab Bar World Tab',
    content: 'This is the World tab, where you can see information about the world such as the positions of objects and the light level. Select the "World" tab to continue the tour!',
    placement: 'right',
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // World Objects Section Step
  {
    id: 'world-objects',
    targetKey: 'world-objects',
    title: 'World Tab Objects Section',
    content: 'This is the world\'s objects section where you can customize the JBC Sandbox to add/remove/edit objects in the 3D simulation.',
    placement: 'right',
    allowTargetInteraction: false,
  },
  // World Can 1 Target Step
  {
    id: 'can1',
    targetKey: 'can1',
    title: 'World Tab Can Object',
    content: 'This is the can object, which is a common object used in challenges.',
    placement: 'right',
  },
  // World Can 1 Visibility Step
  {
    id: 'can1-visibility',
    targetKey: 'can1-visibility',
    title: 'World Tab Object Visibility Option',
    content: 'Click this option to toggle the visibility of the highlighted object in the simulator.',
    placement: 'right',
  },
  // World can 1 Object Reset Step
  {
    id: 'can1-reset',
    targetKey: 'can1-reset',
    title: 'World Tab Object Reset Option',
    content: 'Click this option to reset the highlighted object to its default state in the simulator.',
    placement: 'right',
  },
  // World Can 1 Object Settings Step
  {
    id: 'can1-settings',
    targetKey: 'can1-settings',
    title: 'World Tab Object Settings Option',
    content: 'Click this option to see more settings for the highlighted object such as it\'s name and item type.',
    placement: 'right',
  },
  // World Can 1 Object Remove Step
  {
    id: 'can1-remove',
    targetKey: 'can1-remove',
    title: 'World Tab Object Remove Option',
    content: 'Click this option to remove the highlighted object from the simulator.',
    placement: 'right',
    noBackButton: true,
  }
];

const SimMoveObjectSteps: TourStep[] = [
  // Move Object Overview Step
  {
    id: 'move-object-overview',
    targetKey: 'simulator-area',
    title: 'Move Object Tool Overview',
    content: 'Each object added to the Simulator can be moved using the x, y, z, and rotation controls. This can be useful for testing your code with different object placements.',
    placement: 'right',
    allowTargetInteraction: false,
  },
  // Add Object to World Step
  {
    id: 'move-object-select-world-tab',
    targetKey: 'can1-visibility',
    title: 'Add Can 1 to the World',
    content: 'To move an object, first we need to add the object to the simulator using the visibility option.',
    placement: 'right',

    allowTargetInteraction: true,
  },
  // Select World Tab Step
  {
    id: 'move-object-select-world-tab',
    targetKey: 'tab-World',
    title: 'Select World Tab',
    content: 'Select the "World" tab in the Overlay Tab Bar.',
    placement: 'right',

    allowTargetInteraction: true,
    noNextButton: true,
  },
  // Select Object to Move Step
  {
    id: 'move-object-select-object',
    targetKey: 'can1-visibility',
    title: 'Select Object to Move',
    content: 'Next, click the visibility option for the object you want to move. For this tutorial, we\'ll select the Can 1 object.',
    placement: 'right',
    noBackButton: true,
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // See Object in Simulator Area Step 
  {
    id: 'move-object-see-object',
    targetKey: 'simulator-area',
    title: 'See Object in Simulator Area',
    content: 'After turning on the visibility option, you can see the object in the simulator area.',
    placement: 'right',
    allowTargetInteraction: false,
  },
  // Click Object in Simulator Area Step
  {
    id: 'move-object-click-object',
    targetKey: 'clicked-object',
    title: 'Click Object in Simulator Area',
    content: 'Click the object in the simulator area to open the move object tool.',
    placement: 'left',
    allowTargetInteraction: true,
    noNextButton: true,
  },
  // Move Object Tool Overview Step
  {
    id: 'move-object-tool-overview',
    targetKey: 'clicked-object',
    title: 'Move Object Tool Overview',
    content: 'This is the move object tool, where you can move the object by dragging the gizmo arrows.',
    placement: 'right',
    allowTargetInteraction: false,
  },
  // Move Object Tool Interaction Step
  {
    id: 'move-object-tool-interaction',
    targetKey: 'clicked-object',
    title: 'Move Object Tool Interaction',
    content: 'The red arrow is the x-axis, the green arrow is the y-axis, and the blue arrow is the z-axis. Try dragging the arrows to move the object around in the simulator!',
    placement: 'right',
    allowTargetInteraction: true,
  }
];

const SimulatorTourSteps: TourStep[] = [
  // Sim Overview Step
  {
    id: 'simulator-overview',
    targetKey: 'simulator-overview',
    title: '3D Simulator Overview',
    content: 'Welcome to KIPR\'s 3D Simulator, where you can test your code in a virtual environment.',
    placement: 'top',
    allowTargetInteraction: false,
  },
  {
    id: 'choose-tour',
    targetKey: 'choose-tour',
    title: 'Choose Your Tour',
    placement: 'top',
    content: 'Use this dropdown to select different tours of the simulator interface or just click Next to take the full tour!',
    allowTargetInteraction: false,
    subTourSteps: {
      'Editor and Console Tour': SimEditorConsoleSteps,
      'Main Menu Tour': SimMainMenuSteps,
      'Overlay Tab Bar Tour': SimLeftTabSteps,
      'Move Object Tool Tour': SimMoveObjectSteps,
    }
  }


];

SimulatorTourSteps.push(...SimEditorConsoleSteps);
SimulatorTourSteps.push(...SimMainMenuSteps);
SimulatorTourSteps.push(...SimLeftTabSteps);
SimulatorTourSteps.push(...SimMoveObjectSteps);

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
SimulatorTourSteps.forEach(step => {
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
    case TourDoc.IDS.SIMULATOR:
      return SimulatorTourSteps;
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