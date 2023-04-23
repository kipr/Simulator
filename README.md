# Simulator

![CD staging status](https://github.com/kipr/simulator/actions/workflows/cd-staging.yml/badge.svg)

![CD prod status](https://github.com/kipr/simulator/actions/workflows/cd-prod.yml/badge.svg)

A Robotics Simulator built in TypeScript.
Simulates a botball/JBC style demobot with a built in IDE.

# Development

## Requirements
- [Git Large File Storage](https://git-lfs.github.com/)
- [Node.js v16 or higher](https://nodejs.org/)
- [yarn](https://classic.yarnpkg.com/)
- [CMake](https://cmake.org/)
- [SWIG 4+](https://swig.org/)
- [Python 3.7 or newer](https://www.python.org/)

### Debian/Ubuntu
```bash
# to get newer versions of Node.js through apt-get, you likely need to add the correct NodeSource repositories
# for details, see https://github.com/nodesource/distributions
sudo apt-get update
sudo apt-get install -y wget git cmake build-essential python3.8 swig zlib1g-dev doxygen nodejs
sudo npm install --global npm
sudo npm install --global yarn
yarn --version

#(if yarn does not work, reboot or use "sudo yarn" on the rest of the instructions)
```

### macOS

You will need to install Command Line Tools and [Homebrew](https://brew.sh/) before continuing.

```bash
# If you need Command Line Tools
xcode-select --install

brew install node cmake swig

npm install --global yarn
```

### Windows

It is recommended to use [WSL2](https://docs.microsoft.com/en-us/windows/wsl/about) with Ubuntu on Windows.

## Clone repository and submodules

### Clone this repository and its submodules:

```bash
git clone --recurse-submodules https://github.com/kipr/Simulator
```

Or, if you've already cloned the repository without `--recurse-submodules`, you can initialize the submodules separately:

```bash
git submodule update --init
```

### Optional: Pull large files

```bash
git lfs pull
```

## Build Dependencies

```bash
# Python 3.7+ is required for the build process
python3 dependencies/build.py
```

Tip: if you are experiencing issues with this step, you may try deleting the repository and follow the steps listed above again.

## Install JavaScript Dependencies

Navigate to the root directory of this repository, then run:
```bash
yarn install
```

## Build Translations
```bash
yarn run build-i18n
```

# Running

In one terminal, build in watch mode:
```bash
yarn watch
# If you get an error that says "digital envelope routines::unsupported", use:
NODE_OPTIONS=--openssl-legacy-provider yarn watch
```

In another terminal, run the server:
```bash
node express.js
```

## Configuration

The server can be configured using environment variables. Variables without default values must be provided.

| Variable | Description | Default value |
| -------- | ----------- | ------------- |
| `SERVER_PORT` | The port on which to listen for requests | `3000` |
| `CACHING_STATIC_MAX_AGE` | The max duration (in ms) to allow static assets to be cached | `3600000` (1 hr) |
| `FEEDBACK_WEBHOOK_URL` | The url for the discord webhook to send feedback to | | 
| `API_URL` | The url for the KIPR database server | `https://db-prerelease.botballacademy.org` |

## Using a local `database` service

Clone the [KIPR database](https://github.com/kipr/database) service and follow the instructions. Start the simulator server with:

```sh
API_URL=http://localhost:4000 node express.js
```

## Linting

The project is set up with [ESLint](https://eslint.org/) for JavaScript/TypeScript linting. You can run ESLint manually by running `yarn lint` at the root.

To ease development, we highly recommend enabling ESLint within your editor so you can see issues in real time. If you're using Visual Studio Code, you can use the [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). For other editors, see [available ESLint integrations](https://eslint.org/docs/user-guide/integrations).

## Internationalization (i18n)

Simulator leverages gettext PO files to create a `i18n.json` file located in `/i18n/i18n.json`. The source files are scanned for imports of `@i18n`, and uses of the default exported function (`tr` by convention) are detected and inserted into PO files located in `/i18n/po/`. These PO files are "built" into the JSON file, which is then injected into the frontend via webpack's `DefinePlugin` (see `configs/webpack/common.js` for details). The `tr` function reads this object at runtime to make translations available.

To update the PO files, run `yarn run generate-i18n`. While the generation script *should* preserve your work-in-progress, it is recommended to commit, stash, or otherwise backup the PO files prior to running this script.

To build the PO files into a JSON object suitable for consumption by the frontend, run `yarn run build-i18n`.

There are many editors available for PO files. We recommend [Poedit](https://poedit.net/).

The format of the `i18n.json` is as follows:
```json
{
  "context1": {
    "See `src/util/LocalizedString.ts` for a list of available language identifiers": {
      "en-US": "See `src/util/LocalizedString.ts` for a list of available language identifiers",
      "ja-JP": "利用可能な言語識別子のリストについては、「src/util/LocalizedString.ts」を参照してください"
    }
  },
  "..."
}
```

# Building image

The repo includes a `Dockerfile` for building a Docker image of the simulator:

```
# If you don't have jq, you can just use export VERSION=latest
export VERSION=$(jq -r .version simulator/package.json)
docker build -t kipr/simulator:$VERSION .
docker run -ti -p 3000:3000 kipr/simulator:$VERSION
```
