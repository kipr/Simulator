FROM ubuntu:20.04

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
ENV TZ=America/Los_Angeles
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y wget git cmake build-essential doxygen

RUN wget https://deb.nodesource.com/setup_17.x && chmod +x ./setup_17.x && ./setup_17.x
RUN apt-get install -y nodejs

RUN npm install -g yarn

RUN git clone https://github.com/emscripten-core/emsdk
WORKDIR /emsdk
RUN ./emsdk install 2.0.2
RUN ./emsdk activate 2.0.2

ADD . /app

WORKDIR /app/libwallaby
RUN mkdir build
WORKDIR /app/libwallaby/build
RUN source /emsdk/emsdk_env.sh && emcmake cmake -Demscripten=ON -Dno_wallaby=ON -Dwith_vision_support=OFF -Dbuild_python=OFF -DBUILD_DOCUMENTATION=OFF .. && make -j2


WORKDIR /app
ENV LIBWALLABY_ROOT=/app/libwallaby
EXPOSE 3000
# WORKDIR /app/simulator
# RUN yarn install --cache-folder ./.yarncache && yarn build; true
RUN yarn install --cache-folder ./.yarncache
RUN export NODE_OPTIONS=--openssl-legacy-provider && yarn build
CMD NODE=$(which node)  source /emsdk/emsdk_env.sh && $NODE express.js
