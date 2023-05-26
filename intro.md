# Introduction to the Simulator

This introduction is written for those who would like to get started with contributing to the simulator but need some orientation to get started.

## Directory Overview

Base File Structure:
* Simulator
	* configs
	* dependencies
	* dist
	* i18n
	* node_modules
	* src
	* static
	* test

The two most important folders to get familiar with are the dependencies and the src folders, but here we will cover them all in order. Let's go over these one at a time.

## Configs

Configures the webpack bundling for development of production. From Webpack's documentation:

> At its core, webpack is a static module bundler for modern JavaScript applications. When webpack processes your application, it internally builds a dependency graph from one or more entry points and then combines every module your project needs into one or more bundles, which are static assets to serve your content from.

## Dependencies

Dependencies are code modules used by the simulator. They include several external repositories such as libwallaby, cpython, emsdk, and ammojs. After running build.py as part of the install process, they will also contain the build and install modules for the related dependencies.

To purpose of the core dependencies is as follows:

* libwallaby
	* Developed by KIPR, libwallaby is a library for programming the robot.
* ammo.js
	* A direct port of the Bullet Physics Engine.
* emsdk
	* Emscripten is a complete Open Source compiler toolchain to WebAssembly. Emscripten compiles C and C++ to WebAssembly using LLVM and Binaryen. Emscripten output can run on the Web, in Node.js, and in wasm runtimes.
* cpython
	* CPython is the standard Python software implementation or the default Python interpreter. It is used to allow the execution of python scripts in the simulator's editor.

Additional dependencies are included in the node_modules, and will be discussed below, but it is worth calling out here that the rendering is done through babylon.js, which provides an excellent 3D viewer for the simulator.

## dist

The distribution (dist) folder contains the minified files which are used in production.


## i18n
This is a module for translating all the strings that are displayed to the user into different languages.

This module is used as follows:

```javascript
import tr from '@i18n';
import LocalizedString from '../util/LocalizedString';

LocalizedString.lookup(tr('Example to translate...'), locale)
```

Which allows any text set for display to be translated based on the appropriate locale.

## node_modules

Node modules contain all the node dependencies that are used to make the simulator run. These are installed from the package.json file in the root Simulator directory.


## src

Source (src) contains the source code for the simulator web application. A general note before we begin is that .tsx files contain components which can be rendered whereas .ts files just contain functions, classes, or definitions which can be called. You will find most (but not all) .tsx files in the /components subdirectory.

The first entry point for the web application is the index.tsx, which contains the react root and wraps the main app.

Next of course is App.tsx, which will check if you have been logged in and ask you to log in if you haven't. It also switches you between four Routes:

* /
	* The rout shows the Dashboard page, which is the front page you see which has three clickable components ("Tutorials", "3D Simulator", and "About")
* /tutorials
	* This rout shows the Tutorials page, which is the page which has links to youtube videos on how to get started
* /scene/:sceneId
	* This displays the Root component, which renders a given scene
* /challenge/:challengeId
	* This displays the ChallengeRoot component, which renders a given challenge

Rendered on top of the components described above is the DocumentationWindow component, however this will (may?) only show for the Root and ChallengeRoot components.

The main pages besides the actual simulator are the Dashboard page, the Tutorials page, and the LoginPage, which is located outside /pages, in /login.

The simulator itself is rendered either through the Root or ChallengeRoot components which are located in the /components folder.

Components - where most of the UI exists:
* root is where the logic exists for laying out the UI
	* holds the code that exists, the simulator state, settings, current theme
* layouts
	* Side layout and overlay layout
* Editor
	* implements the monico editor
* Documentation
	* holds the documentation system
	* pops up in the simulator
	* functions, modules, etc

In the next section we will go over the key concepts for the simulator, but first let's briefly examine the last two folders.


## static

Static contains unchanging (static) items, including:
* .png files
	* Pictures
* .glb files
	* “GL Transmission Format Binary file”, is a standardized file format used to share 3D data. Precisely, it can contain information about 3D models, scenes, models, lighting, materials, node hierarchy and animations.
* .blend files
	* A BLEND file is a 3D image or animation project created with Blender, an open-source 3D modeling program.
* draco_decoder files (.js/.wasm)
	* Decompresses 3D files



## test

Seems to be for verifying unit math?


# Key Simulator Concepts

At the highest level, the simulator is taking the state of the simulated world and everything in it and rendering that for us in the browser. The state of the world then gets updated, either by a robot action or some change caused by the physics engine (a can rolling or a box falling), and is then rendered again for us to view. Let's break that down further.

## State
State is ultimately a description of things in the world. This description consists of the properties (position, weight, color, etc.), which typically have values (2in in the x direction, 3in in the y direction, 2 lbs, and green, etc.). The state includes all the objects that exist in our simulated world, including the floor mat, the objects such as a can or paper ream, and the robot, described in full detail (wheels, chassis, motors, etc.).

The robot schema is defined in state/State/Robot (similar to a URDF - set of links and joints but they are all just mapped to Frames, which can be anything). 

## Nodes
Nodes are the objects that exist in the state. All of the objects are described with a nearly complete set of physical properties, including size, position, weight, friction, etc. The nodes exist in relation to one another and can interact with one another according to the principles of the challenge and the constraints of the physics engine. Examples of nodes include objects such as a can, a cube, a light, and many others.

Nodes always have units completely specified, e.g. feet or lbs

## Scene
A scene is a state populated by a particular set of objects. One scene might have a ream of paper, another scene might have a pop can. A scene is essentially a set of nodes. Scenes also contain scripts.

Scene functionality includes:
* can execute arbitrary code
* javascript jobs
* have access to the scene api
* add, remove, detect collision
* see intersections

## Redux

See /state/reducer/

We capture the entire state of the world with a library called redux, which creates a global json blob that can be rendered to the view. The redux library helps reduce the computation by ensuring only components that need to be updated are updated. Through the redux we can add or remove scenes or nodes.

The primary reason for using redux is because of the database. This will allow us to load scenes from the database.

One important type is Async - this allows us to note the difference in state between the client and that database. The async type has the brief (which can be sent very cheaply - just name and description) and the type is the full record. This can be in a number of states. The Async is a state machine of the processes that can happen between the client and the database.

Redux allows us to make the following work: State + Action -> NewState. This is only for global state settings, not for local state.

## Challenge
A challenge is a set of constraints on the world. It includes a dictionary of events which have named objects and descriptions of what needs to be done with that object (e.g. pick up can A). It has encoded the logic of success inside it. There are predicates for success and failure which can use basic boolean logic. Challenges include basic metadata and default starter code in supported languages.


## Robot
A Robot is a node instantiated with a URDF. It has:
* geometries, origins
* Frames, links, actuators, sensors
* Kinematic tree
* Simulator exposes this to the running user program
	* e.g. demobot/wombat

The simulator supports having multiple robot nodes.



## User Programs
User programs run through webworkers. A webworker is a new process with its own address space. The webworker communicates with the robot in the physics engine through shared array buffers.

The user program is edited through the console, which has a std out, implemented as a ring buffer. The start button calls the handler for the language and runs the main method.

## Worker instance
What the simulator uses to talk to the worker. Someone calls start - reset some registers and post to the worker 'start', also controls how the worker terminates.


Worker is housed in worker.ts, the other parts of the communication layer are in workerInstance and workerProtocol. The workerProtocol defines the types that are passed back and forth, the workerInstance is the browser side of the communication system.

When the user program runs, it calls workerInstance's start function. WorkerInstance is a singleton inside the system. This instance communicates with the server to compile the users program. The program runs through the actual KIPR library on the client side (dependencies/libwallaby/module/core/device -> emscripten_fs -python or emcripten_js -c/cpp), but instead of writing the register values to the motor ports, they are written to the registers in worker.ts

The user's code can run completely offline on just the client, it only needs to be compiled to javascript with libwallaby on the server (or interpreted in python's case).

When the code runs it creates a new shared register and shared buffer. The SharedRegistersRobot is bound to the AbstractRobot. The AbstractRobot is what the system uses to determine what the actual motor positions and velocities are.

The output of the code (stdout and stderror) are written to the shared console. The shared registers and the shared console are implemented as shared buffer arrays. Both the worker and the browser can access this shared memeory simultaneously. So the client polls the ringbuffer in order to update the console.

The users code is run sync, and cannot be run async. There is no way to do some processing or an event loop on the side. This is why the communication is done through the array buffers, as it does not require seperate message passing which could interrupt the users program flow. The values are written by the worker instance which runs in its own thread, and the simulator reads those updates and updates the simulator objects accordingly.


## Sim

Every render the updateStore_ function is called, and sceneBinding_ is ticked. In SceneBinding, the tick function takes a dictionary of AbstractRobots (currently there is one, but in the future there could be more), and the tick function calls tick on each robotBinding. The robotBinding is what does the update logic for each robot. The RobotBinding takes the abstract robot and reads the motors, servos, etc and then implements the update logic based on what is happening in the shared registers.


