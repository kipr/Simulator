#!/bin/bash

cd ..

#Run the server
sleep 5
pwd
cd emsdk
source emsdk_env.sh
cd ../simulator
LIBWALLABY_ROOT=../libwallaby node express.js

