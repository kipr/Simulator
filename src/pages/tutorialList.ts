import Tutorial from './interfaces/tutorial.interface';

import tr from '@i18n';

export const tutorialList: Tutorial [] = [
  {
    title: tr('Quick Start'),
    description: tr('Learn how to get started with the simulator'),
    backgroundColor: '#6c6ca1',
    backgroundImage: 'url(../../static/Laptop_Icon_Sunscreen.png)',
    src: 'https://www.youtube.com/embed/7Szf-iQjNCw',
  },
  {
    title: tr('Navigating in 3D'),
    description: tr('Learn the controls for navigating in 3D in the simulator'),
    backgroundImage: 'linear-gradient(#3b3c3c, transparent), url(../../static/Simulator_Full_View.png)',
    src: 'https://www.youtube.com/embed/RBpWIpBlYK8',
  },
  {
    title: tr('Robot Section'),
    description: tr('How to use the robot section'),
    backgroundImage: 'url(../../static/Simulator-Robot-Closeup.png)',
    src: 'https://www.youtube.com/embed/SmYR1esidcc',
  },
  {
    title: tr('World Section'),
    description: tr('Learn how to create and manipulate items and scene in the simulator'),
    backgroundImage: 'linear-gradient(#3b3c3c, transparent), url(../../static/Can_Ream.png)',
    src: 'https://www.youtube.com/embed/K7GsS8s3Rfg',
  },
];
