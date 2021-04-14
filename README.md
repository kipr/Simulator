# Simulator
A Robotics Simulator built in typescript.
Simulates a botball/JBC style demobot with a built in IDE.

# Development

## Automated Setup
Navigate to the root of this repository (cd /path/to/simulator/)
```bash
sudo chmod 777 install.sh
sudo ./install.sh
```

## Manual Setup

### Requirements
- [Node.js](https://nodejs.org/)
- [yarn](https://classic.yarnpkg.com/)
- Doxygen (libwallaby requirement)

```bash
sudo apt-get install nodejs
sudo apt-get install doxygen
sudo npm install --global npm
sudo npm install --global yarn
yarn --version

#(if yarn does not work, reboot or use "sudo yarn" on the rest of the instructions)
```

If you do not have cmake and make:
```bash
sudo apt-get install cmake
sudo apt-get install build-essential
```

### Install Emscripten

See more info here: https://emscripten.org/docs/getting_started/downloads.html

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
```

### Install Dependencies

Navigate to the root directory of this repository, then run:
```bash
yarn install
```

### Build libwallaby for JavaScript

Clone `libwallaby`:
```bash
git clone https://github.com/kipr/libwallaby.git
mkdir libwallaby/build
cd libwallaby/build
```

Then build:
```bash
source $PATH_TO_EMSDK/emsdk_env.sh
emcmake cmake -Demscripten=ON -Dno_wallaby=ON -Dwith_vision_support=OFF -Dbuild_python=OFF -DBUILD_DOCUMENTATION=OFF ..
emmake make -j8
```

## Running

In one terminal, build in watch mode:
```bash
yarn watch
```

In another terminal, run the server:
```bash
source $PATH_TO_EMSDK/emsdk_env.sh
LIBWALLABY_ROOT=/path/to/libwallaby node express.js
```

## Linting

The project is set up with [ESLint](https://eslint.org/) for JavaScript/TypeScript linting. You can run ESLint manually by running `yarn lint` at the root.

To ease development, we highly recommend enabling ESLint within your editor so you can see issues in real time. If you're using Visual Studio Code, you can use the [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). For other editors, see [available ESLint integrations](https://eslint.org/docs/user-guide/integrations).