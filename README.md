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

## Running

In one terminal, run:
```
source $PATH_TO_EMSDK/emsdk_env.sh
node express.js
```

In another terminal, run:
```
yarn watch
```