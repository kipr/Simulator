#!/bin/bash

cd .. #fix directory to be outside simulator
mkdir simulator_server
cp -r simulator simulator_server
cd simulator_server

#Install all the prerequisit software
echo
echo Install all the prerequisite software...
echo

sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash - #For node v14
sudo apt-get install nodejs -y
sudo apt-get install doxygen -y
sudo apt-get install npm -y
sudo npm install --global npm
sudo npm install --global yarn
yarn --version


#Just in case, install cmake and make...
echo
echo Just in case, install cmake and make...
echo

sudo apt-get install cmake
sudo apt-get install build-essential


#Install emscripten
echo
echo Install emscripten..
echo

git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install 2.0.2
./emsdk activate 2.0.2
cd ..

#Download and install simulator
echo
echo Download and install simulator
echo

git clone https://github.com/kipr/simulator.git
cd simulator
yarn install
cd ..


#Install libwallaby
echo
echo "Install libwallaby"
echo

git clone https://github.com/kipr/libwallaby.git
mkdir libwallaby/build

#Fix directory and add emsdk_env.sh to $PATH temporarily
echo
echo "Fix directory and add emsdk_env.sh to PATH temporarily"
echo

cd emsdk
source emsdk_env.sh
cd ..


#Build Libwallaby (for emscripten)
echo
echo "Build Libwallaby (for emscripten)"
echo

cd libwallaby/build
emcmake cmake -Demscripten=ON -Dno_wallaby=ON -Dwith_vision_support=OFF -Dbuild_python=OFF -DBUILD_DOCUMENTATION=OFF ..
emmake make -j8
cd ../..


#Run the Server in parralel
sudo chmod 777 simulator/runServer.sh
cd simulator
sudo ./runServer.sh &
cd ..

#Build Simulator in watch mode and run in background
echo
echo Build Simulator in watch mode and run in background
echo

cd simulator
yarn watch


