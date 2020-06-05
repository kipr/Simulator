# Simulator
Simulator for the Wombats.

# Development

## Initial Setup

### Requirements
- [Node.js](https://nodejs.org/)
- [yarn](https://classic.yarnpkg.com/)

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

Clone `libwallaby` on the `emscripten` branch:
```bash
git clone --branch emscripten https://github.com/kipr/libwallaby.git
mkdir libwallaby/build
cd libwallaby/build
```

Then build:
```bash
source $PATH_TO_EMSDK/emsdk_env.sh
emcmake cmake -Dwith_vision_support=OFF -Dwith_graphics_support=OFF -Dno_wallaby=ON -Dbuild_python=OFF .. -DJS_ONLY=ON
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
