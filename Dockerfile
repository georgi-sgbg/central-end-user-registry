FROM mhart/alpine-node:10.15.1
USER root

WORKDIR /opt/central-end-user-registry
COPY src /opt/central-end-user-registry/src
COPY migrations /opt/central-end-user-registry/migrations
COPY config /opt/central-end-user-registry/config
COPY package.json server.sh /opt/central-end-user-registry/
COPY seeds /opt/central-end-user-registry/seeds

RUN apk add --no-cache make gcc g++ python libtool autoconf automake && \
    cd $(npm root -g)/npm && \
    apk add -U iproute2 && ln -s /usr/lib/tc /lib/tc && \
    apk add -U iptables && \
    npm install -g node-gyp && \
    chmod +x /opt/central-end-user-registry/server.sh

RUN npm install -g tape && \
    npm install -g tap-xunit

RUN npm install
RUN npm uninstall -g npm

EXPOSE 3001

CMD ["/opt/central-end-user-registry/server.sh"]
