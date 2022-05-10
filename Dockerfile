FROM python:3.8.13-slim-buster
LABEL maintainer="Ben Hardill hardillb@gmail.com"

RUN \
  apt-get update && apt-get install -yqq wget gnupg libdbus-1-dev libglib2.0-dev build-essential && \
  echo "deb https://deb.nodesource.com/node_12.x buster main" > /etc/apt/sources.list.d/nodesource.list && \
  wget -qO- https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
  apt-get update && \
  apt-get install -yqq nodejs && \
  pip install -U pip && pip install pipenv && \
  npm i -g npm@^6 && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY . .
RUN pip install mdns-publisher && \
  npm install

CMD ["npm", "start"]
