# traefik-avahi-helper

A helper container to expose proxied containers as mDNS CNAMEs that are being proxied by
the offical Traefik docker container.

It reads the same container labels as the Traefik container e.g.

```
traefik.http.routers.r1.rule=Host(`r1.docker.local`)
```

This will create a CNAME entry of `r1.docker.local`

## Installing

`docker pull hardillb/traefik-avahi-helper`

Currently there are AMD64 and ARM64 based builds.

## Running

To work this needs the following 2 volumes mounting:


` -v /var/run/docker.sock:/var/run/docker.sock`

This allows the container to monitor docker

` -v /run/dbus/system_bus_socket:/run/dbus/system_bus_socket`

And this allows the container to send d-bus commands to the host OS's Avahi daemon

```
$ docker run -d -v /var/run/docker.sock:/var/run/docker.sock -v /run/dbus/system_bus_socket:/run/dbus/system_bus_socket hardillb/traefik-avahi-helper 
```

## AppArmor

If you are running on system with AppArmor installed you may get errors about not being able to send d-bus messages. To fix this add
`--privileged` to the command line.

This is a temp workaround until I can work out a suitable policy to apply.

## Acknowledgement

This uses and borrows heavily from [mdns-publisher](https://github.com/alticelabs/mdns-publisher)
