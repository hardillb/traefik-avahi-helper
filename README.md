# traefik-avahi-helper

A helper container to expose proxied containers as mDNS CNAMEs

## Running

```
$ docker run -d -v /var/run/docker.sock:/tmp/docker.sock -v /run/dbus/system_bus_socket:/run/dbus/system_bus_socket hardillb/traefik-avahi-helper 
```