# --- Base Image ---
FROM python:3.10.10-alpine3.17 AS base
LABEL maintainer="Ben Hardill <hardillb@gmail.com>"

# Systempakete inkl. Build-Tools und dbus-dev
RUN apk add --no-cache \
    dbus dbus-dev dbus-libs \
    glib-dev \
    build-base \
    cmake ninja \
    nodejs npm python3 py3-pip

# --- Build Stage ---
WORKDIR /usr/src/app
COPY package.json package-lock.json ./

# npm packages
RUN npm ci --omit=dev

# Python packages
RUN pip install --no-cache-dir mdns-publisher

# --- Final Image ---
FROM base
WORKDIR /usr/src/app

# Copy app
COPY index.js cname.py ./
COPY --from=base /usr/src/app/node_modules ./node_modules
#COPY --from=base /root/.local /root/.local

# PATH für pip-User
ENV PATH=/root/.local/bin:$PATH

CMD ["node", "index.js"]
