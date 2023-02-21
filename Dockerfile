FROM ubuntu:20.04

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
ENV TZ=America/Los_Angeles
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y wget git cmake build-essential python3.8 swig zlib1g-dev doxygen default-jre python2.7

RUN wget https://deb.nodesource.com/setup_17.x && chmod +x ./setup_17.x && ./setup_17.x
RUN apt-get install -y nodejs

RUN npm install -g yarn

ADD . /app

EXPOSE 3000
WORKDIR /app/
RUN yarn run build-deps
# WORKDIR /app/simulator
# RUN yarn install --cache-folder ./.yarncache && yarn build; true
RUN yarn install --cache-folder ./.yarncache
RUN yarn run build-i18n
RUN export NODE_OPTIONS=--openssl-legacy-provider && yarn build
CMD node express.js
