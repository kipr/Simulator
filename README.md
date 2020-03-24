# 2D-Simulator
2D simulator for the Wombats.

# Development

## Initial Setup

### Install Emscripten

See more info here: https://emscripten.org/docs/getting_started/downloads.html

```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
```

### Install Dependencies

Navigate to the root directory, then run:
```
yarn install
```

### Build libwallaby for javascript

Make sure you are on the `emscripten` branch!
```
cd libwallaby/build
emcmake cmake -Dwith_vision_support=OFF -Dwith_graphics_support=OFF -Dno_wallaby=ON -Dbuild_python=OFF .. -DJS_ONLY=ON
emmake make -j8
```

## Running

In one terminal, run:
```
source $PATH_TO_EMSDK/emsdk_env.sh
LIBWALLABY_ROOT=/path/to/libwallaby node express.js
```

In another terminal, run:
```
yarn watch
```

