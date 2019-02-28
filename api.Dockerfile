FROM mhart/alpine-node:10.15.1
USER root

WORKDIR /opt/central-end-user-registry
COPY src /opt/central-end-user-registry/src
COPY migrations /opt/central-end-user-registry/migrations
COPY config /opt/central-end-user-registry/config
COPY package.json server.sh /opt/central-end-user-registry/

RUN apk add --no-cache -t build-dependencies make gcc g++ python libtool autoconf automake \
    && cd $(npm root -g)/npm \
    && npm install -g node-gyp \
    && apk --no-cache add git

RUN npm install && \
    npm uninstall -g npm

RUN apk del build-dependencies

EXPOSE 3000
CMD node src/server.js
