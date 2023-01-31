FROM python:3.9.16-alpine3.17
LABEL maintainer="Ben Hardill hardillb@gmail.com"

RUN \
  apk add --update alpine-sdk make cmake pkgconfig gcc libc-dev g++ glib-dev linux-headers dbus dbus-dev && \
  apk add --update 'nodejs<19' 'npm<10' && \
  pip install -U pip && pip install pipenv

WORKDIR /usr/src/app

COPY . .
RUN pip install mdns-publisher && \
  npm install

CMD ["npm", "start"]
