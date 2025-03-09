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
sudo apt-get install -y wget git cmake build-essential python3.8 swig zlib1g-dev doxygen nodejs pkg-config
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
cd dependencies/kipr-scratch/libwallaby && git submodule update --init
```

### Optional: Pull large files

```bash
git lfs pull
```

## Build Dependencies

```bash
# Python 3.7+ is required for the build process
yarn run build-deps
# The build-deps command executes:
"python3 dependencies/build.py && yarn add file:dependencies/kipr-scratch/kipr-scratch --cache-folder ./.yarncache",

```
Tip: if you are experiencing issues with this step, you may try deleting the repository and follow the steps listed above again.

### Notes on building dependencies
```python3 dependencies/build.py```

1. Run some setup checks
2. Build libwallaby (probably only need to do this once)
3. Delete ''unnecessary blocks' from scratch-blocks/blocks-vertical (renames them with a .old extension)
    - 'event.js',
    - 'extensions.js',
    - 'default_toolbox.js',
    - 'looks.js',
    - 'motion.js',
    - 'sensing.js',
    - 'sound.js'


4. blockify libwallaby
    - Input is libwallaby-build, output is in scratch-blocks/blocks_vertical
    - Start by parsing the xml result of the libwallaby build
      - Essentially getting all the functions from the included files and cdecl nodes
      - Ends up with a list of modules and their functions
    - For all functions, needs to generate a blockly block of the module_function with
      with the correct parameters and return types.
      - Only does it for analog, digital, wait_for, time, motor, and servo modules
    - Patches the colors in core/colours.js for the new modules from info in module_hsl.json
    - Writes a new default_toolbox.js - this is what we have access to pick from
    - Modifies the category names in the vertical extensions file, removing 'sounds', 'motion', 
      'looks', 'event', 'sensing', 'pen', but adding our modules
    - Modifies the messages to include those from our modules and the program start
    - Modifies the css flyout style
    - Modifies the field variables to remove non initialization case
  

5. Install the scratch blocks




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

See [Configuration](#configuration) for environment variables. The server will not run unless the required environment variables are set.

## Configuration

The server can be configured using environment variables. Some variables are required.

| Variable | Description | Default value | Required |
| -------- | ----------- | ------------- | -------- |
| `SERVER_PORT` | The port on which to listen for requests | `3000` | no |
| `CACHING_STATIC_MAX_AGE` | The max duration (in ms) to allow static assets to be cached | `3600000` (1 hr) | no |
| `FEEDBACK_WEBHOOK_URL` | The url for the discord webhook to send feedback to | | no |
| `API_URL` | The url for the KIPR database server | `https://db-prerelease.botballacademy.org` | no |
| `FIREBASE_SERVICE_ACCOUNT_KEY_FILE` | Firebase service account key JSON (as a file path). Only used if `FIREBASE_SERVICE_ACCOUNT_KEY_STRING` is not present | | yes* |
| `FIREBASE_SERVICE_ACCOUNT_KEY_STRING` | Firebase service account key JSON (as a string) | | yes* |
| `MAILGUN_API_KEY` | API key for Mailgun service | | no |
| `MAILGUN_DOMAIN` | Domain used for Mailgun emails | | no |

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
