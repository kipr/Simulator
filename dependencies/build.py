#!/usr/bin/python3

import os
import subprocess
import pathlib
import json
import multiprocessing
import hashlib

def sha1OfFile(filepath):
  sha = hashlib.sha1()
  with open(filepath, 'rb') as f:
    while True:
      block = f.read(2**10) # Magic number: one-megabyte blocks.
      if not block: break
      sha.update(block)
    return sha.hexdigest()

def hash_dir(dir_path):
  hashes = []
  for path, dirs, files in os.walk(dir_path):
    for file in sorted(files):
      hashes.append(sha1OfFile(os.path.join(path, file)))
    for dir in sorted(dirs):
      hashes.append(hash_dir(os.path.join(path, dir)))
    break
  return str(hash(''.join(hashes)))

def is_tool(name):
    """Check whether `name` is on PATH and marked as executable."""
    from shutil import which
    return which(name) is not None

# Sanity checks

if not is_tool('cmake'):
    print('CMake is not installed. Please install CMake and try again.')
    exit(1)

if not is_tool('make'):
    print('Make is not installed. Please install Make and try again.')
    exit(1)

if not is_tool('swig'):
    print('SWIG is not installed. Please install SWIG and try again.')
    exit(1)

if not is_tool('doxygen'):
    print('Doxygen is not installed. Please install Doxygen and try again.')
    exit(1)

working_dir = pathlib.Path(__file__).parent.absolute()

emsdk_dir = working_dir / 'emsdk'

emsdk_version = '3.1.19'

# Install emsdk 3.1.19
print(f'Installing emsdk {emsdk_version}')
subprocess.run(
  [emsdk_dir / 'emsdk', 'install', emsdk_version],
  check = True
)

# Activate emsdk 3.1.19
print(f'Activating emsdk {emsdk_version}')
subprocess.run(
  [emsdk_dir / 'emsdk', 'activate', emsdk_version],
  check = True
)

# Find paths to emsdk dependencies
print('Finding emsdk paths')

emsdk_upstream_dir = emsdk_dir / 'upstream' / 'emscripten'
emsdk_node_dir = emsdk_dir / 'node' / os.listdir(emsdk_dir / 'node')[0]
emsdk_path = f'{emsdk_dir}:{emsdk_upstream_dir}:{emsdk_node_dir}'
path = os.environ['PATH']
path = f'{emsdk_path}:{path}'


emsdk_dot_emscripten = emsdk_dir / '.emscripten'

env = {
  'PATH': path,
  'EMSDK': f'{emsdk_dir}',
  'EM_CONFIG': f'{emsdk_dot_emscripten}'
}

libkipr_dir = working_dir / 'libwallaby'
libkipr_hash = hash_dir(libkipr_dir)

# libkipr (C)

print('Configuring libkipr (C)...')

libkipr_build_c_dir = working_dir / 'libkipr_build_c'
libkipr_install_c_dir = working_dir / 'libkipr_install_c'
os.makedirs(libkipr_build_c_dir, exist_ok=True)

subprocess.run(
  [
    'emcmake',
    'cmake',
    '-Dwith_camera=OFF',
    '-Dwith_tello=OFF',
    '-Dwith_python_binding=OFF',
    '-Dwith_documentation=ON',
    '-Dwith_tests=OFF',
    '-Dwith_graphics=OFF',
    f'-DCMAKE_INSTALL_PREFIX={libkipr_install_c_dir}',
    libkipr_dir
  ],
  cwd = libkipr_build_c_dir,
  check = True,
  env = env
)

print('Building libkipr (C)...')
subprocess.run(
  [ 'emmake', 'make', f'-j{multiprocessing.cpu_count()}' ],
  cwd = libkipr_build_c_dir,
  check = True,
  env = env
)

print('Installing libkipr (C)...')
subprocess.run(
  [ 'emmake', 'make', 'install' ],
  cwd = libkipr_build_c_dir,
  check = True,
  env = env
)

# CPython

cpython_dir = working_dir / 'cpython'

print('Applying cpython patches...')
for patch_file in (working_dir / 'cpython_patches').glob('*.patch'):
    print('Applying patch:', patch_file)
    with open(patch_file) as patch:
        subprocess.run(
            ['patch', '-p0', '--forward'],
            stdin = patch,
            cwd = working_dir
        )

print('Finding latest host python...')

python = 'python3'
if is_tool('python3.12'):
    python = 'python3.12'
elif is_tool('python3.11'):
    python = 'python3.11'
elif is_tool('python3.10'):
    python = 'python3.10'
elif is_tool('python3.9'):
    python = 'python3.9'
elif is_tool('python3.8'):
    python = 'python3.8'
elif is_tool('python3.7'):
    python = 'python3.7'
else:
    print('Warning: Python 3.7+ could not be found. Using python3. This might not work.')

print(f'Building cpython with {python}...')
subprocess.run(
  [python, 'Tools/wasm/wasm_build.py', 'emscripten-browser'],
  cwd = cpython_dir,
  env = env,
  check = True
)

print('Installing cpython to prefix...')
cpython_emscripten_build_dir = cpython_dir / 'builddir' / 'emscripten-browser'
cpython_install_prefix_dir = cpython_emscripten_build_dir / 'prefix'
subprocess.run(
  f'make install DESTDIR={cpython_install_prefix_dir}',
  shell = True,
  cwd = cpython_emscripten_build_dir,
  env = env,
  check = True
)


# libkipr (Python)

print('Configuring libkipr (Python)...')
libkipr_build_python_dir = working_dir / 'libkipr_build_python'
os.makedirs(libkipr_build_python_dir, exist_ok=True)

# Find 

subprocess.run(
  [
    'emcmake',
    'cmake',
    '-Dwith_camera=OFF',
    '-Dwith_tello=OFF',
    '-Dwith_documentation=OFF',
    '-Dwith_tests=OFF',
    '-Dwasm=ON',
    f'-DPYTHON_LIBRARY={cpython_install_prefix_dir}/usr/local/lib/libpython3.12.a',
    f'-DPYTHON_INCLUDE_DIR={cpython_install_prefix_dir}/usr/local/include/python3.12',
    libkipr_dir
  ],
  cwd = libkipr_build_python_dir,
  check = True,
  env = env
)

print('Building libkipr (Python)...')
subprocess.run(
  [ 'emmake', 'make', f'-j{multiprocessing.cpu_count()}' ],
  cwd = libkipr_build_python_dir,
  check = True,
  env = env
)


print('Generating JSON documentation...')
libkipr_c_documentation_json = f'{libkipr_build_c_dir}/documentation/json.json'
subprocess.run(
  [ python, 'generate_doxygen_json.py', f'{libkipr_build_c_dir}/documentation/xml', libkipr_c_documentation_json ],
  # [ 'python3', 'generate_doxygen_json.py', f'{libkipr_build_c_dir}/documentation/xml', libkipr_c_documentation_json ],
  cwd = working_dir,
  check = True
)

print('Building kipr-scratch...')
kipr_scratch_path = working_dir / 'kipr-scratch'
subprocess.run(
  [ python, kipr_scratch_path / 'build.py' ],
  cwd = kipr_scratch_path,
  check = True
)

print('Packaging kipr-scratch...')
subprocess.run(
  [ python, kipr_scratch_path / 'package.py' ],
  cwd = kipr_scratch_path,
  check = True
)

print('Generating scratch runtime...')
scratch_runtime_path = working_dir / 'scratch-rt'
# emcc -s WASM=0 -s INVOKE_RUN=0 -s ASYNCIFY -s EXIT_RUNTIME=1 -s "EXPORTED_FUNCTIONS=['_main', '_simMainWrapper']" -I${config.server.dependencies.libkipr_c}/include -Wl,--whole-archive -L${config.server.dependencies.libkipr_c}/lib -lkipr -o ${path}.js ${path}
subprocess.run([
    'emcc',
    '-sWASM=0',
    '-sINVOKE_RUN=0',
    '-sEXIT_RUNTIME=0',
    '-sERROR_ON_UNDEFINED_SYMBOLS=0',
    '-sLINKABLE=1',
    '-sEXPORT_ALL=1',
    f'-L{libkipr_install_c_dir}/lib',
    '-Wl,--whole-archive', '-lkipr', '-Wl,--no-whole-archive',
    f'-o', f'{scratch_runtime_path}.js',
    f'{scratch_runtime_path}.c'
  ],
  env = env,
  check = True
)

print('Outputting results...')
output = json.dumps({
  'emsdk_version': emsdk_version,
  'emsdk_path': f'{emsdk_dir}',
  'emsdk_env': {
    'PATH': emsdk_path,
    'EMSDK': f'{emsdk_dir}',
    'EM_CONFIG': f'{emsdk_dot_emscripten}'
  },
  'libkipr_hash': libkipr_hash,
  'libkipr_c': f'{libkipr_install_c_dir}',
  'libkipr_python': f'{libkipr_build_python_dir}',
  'cpython': f'{cpython_emscripten_build_dir}',
  'cpython_hash': hash_dir(cpython_dir),
  "libkipr_c_documentation": libkipr_c_documentation_json,
  'scratch_rt': f'{scratch_runtime_path}.js',
})

with open(working_dir / 'dependencies.json', 'w') as f:
    f.write(output)
