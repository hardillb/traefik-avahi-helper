# --- Base Image ---
FROM node:20-alpine3.18 AS base
LABEL maintainer="Ben Hardill <hardillb@gmail.com>"

# Systempakete inkl. Build-Tools und dbus-dev
RUN apk add --no-cache \
    dbus dbus-dev dbus-libs \
    glib-dev \
    build-base \
    cmake ninja \
    python3-dev py3-pip

# --- Build Stage ---
WORKDIR /usr/src/app
COPY package.json package-lock.json ./

# npm packages
RUN npm ci --omit=dev

# Python packages
RUN pip install --no-cache-dir mdns-publisher

# --- Final Image ---
FROM node:20-alpine3.18 AS ship
LABEL maintainer="Ben Hardill <hardillb@gmail.com>"

RUN apk add --no-cache \
    dbus dbus-libs \
    python3

WORKDIR /usr/src/app

# Copy app
COPY index.js cname.py ./
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/lib/python3.11/site-packages /usr/lib/python3.11/site-packages

CMD ["node", "index.js"]
