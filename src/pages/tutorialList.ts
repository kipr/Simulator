import * as React from 'react';
import Tutorial from './interfaces/tutorial.interface';

export const tutorialList: Tutorial [] = [
  {
    title: 'Quick Start',
    description: 'Learn how to get started with the simulator',
    backgroundColor: '#6c6ca1',
    backgroundImage: 'url(../../static/Laptop_Icon_Sunscreen.png)',
    src: 'https://www.youtube.com/embed/7Szf-iQjNCw',
  },
  {
    title: 'Navigating in 3D',
    description: 'Learn the controls for navigating in 3D in the simulator',
    backgroundImage: 'linear-gradient(#3b3c3c, transparent), url(../../static/Simulator_Full_View.png)',
    src: 'https://www.youtube.com/embed/RBpWIpBlYK8',
  },
  {
    title: 'Robot Section',
    description: 'How to use the robot section',
    backgroundImage: 'url(../../static/Simulator-Robot-Closeup.png)',
    src: 'https://www.youtube.com/embed/SmYR1esidcc',
  },
  {
    title: 'World Section',
    description: 'Learn how to create and manipulate items and scene in the simulator',
    backgroundImage: 'linear-gradient(#3b3c3c, transparent), url(../../static/Can_Ream.png)',
    src: 'https://www.youtube.com/embed/K7GsS8s3Rfg',
  },
];
