# Simulator

![CD staging status](https://github.com/kipr/simulator/actions/workflows/cd-staging.yml/badge.svg)

![CD prod status](https://github.com/kipr/simulator/actions/workflows/cd-prod.yml/badge.svg)

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
- [Node.js v14 or higher](https://nodejs.org/)
- [yarn](https://classic.yarnpkg.com/)
- Doxygen (libwallaby requirement)

```bash
# to get newer versions of Node.js through apt-get, you likely need to add the correct NodeSource repositories
# for details, see https://github.com/nodesource/distributions
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

### Clone repository and submodules

Clone this repository and its submodules:

```bash
git clone --recurse-submodules https://github.com/kipr/Simulator
```

Or, if you've already cloned the repository without `--recurse-submodules`, you can initialize the submodules separately:

```bash
git submodule update --init
```

### Install Emscripten

See more info here: https://emscripten.org/docs/getting_started/downloads.html

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install 2.0.2
./emsdk activate 2.0.2
```

### Install Dependencies

Navigate to the root directory of this repository, then run:
```bash
yarn install
```

### Build libwallaby for JavaScript

Build `libwallaby`:
```bash
mkdir libwallaby/build
cd libwallaby/build

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
node express.js
```

## Configuration

The server can be configured using environment variables. Variables without default values must be provided.

| Variable | Description | Default value |
| -------- | ----------- | ------------- |
| `LIBWALLABY_ROOT` | Path to the root directory of libwallaby | `./libwallaby` |
| `SERVER_PORT` | The port on which to listen for requests | `3000` |
| `CACHING_STATIC_MAX_AGE` | The max duration (in ms) to allow static assets to be cached | `3600000` (1 hr) |

## Linting

The project is set up with [ESLint](https://eslint.org/) for JavaScript/TypeScript linting. You can run ESLint manually by running `yarn lint` at the root.

To ease development, we highly recommend enabling ESLint within your editor so you can see issues in real time. If you're using Visual Studio Code, you can use the [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). For other editors, see [available ESLint integrations](https://eslint.org/docs/user-guide/integrations).

# Building image

The repo includes a `Dockerfile` for building a Docker image of the simulator:

```
# If you don't have jq, you can just use export VERSION=latest
export VERSION=$(jq -r .version simulator/package.json)
docker build -t kipr/simulator:$VERSION .
docker run -ti -p 3000:3000 kipr/simulator:$VERSION
```
