FROM python:3.10.10-alpine3.17 as base
LABEL maintainer="Ben Hardill hardillb@gmail.com"
RUN apk add --no-cache --update  \
  dbus-libs \
  'nodejs<19'

# Install dependencies
FROM base as compile-image

WORKDIR /usr/src/app

RUN apk add --no-cache --update \
    cmake \
    g++ \
    glib-dev \
    dbus \
    dbus-dev \
    glib-dev \
    'npm<10' && \
  pip install --upgrade --no-cache-dir pip

RUN pip install --user --no-cache-dir mdns-publisher

COPY package.json package-lock.json .
RUN npm ci --production

# Build application
FROM base as build-image

WORKDIR /usr/src/app

# app
COPY cname.py index.js .
# npm packages
COPY --from=compile-image /usr/src/app/node_modules node_modules
# pip packages
COPY --from=compile-image /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

CMD ["node", "index.js"]
