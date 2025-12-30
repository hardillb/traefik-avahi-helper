const Docker = require("dockerode");
const fs = require("fs");
const nodemon = require("nodemon");

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const re = /traefik\.http\.routers\.(.*)\.rule/;
const domainRe = /`(?<domain>[^`]*?\.local)`/g;

let cnames = [];

// Hilfsfunktion: Domains extrahieren
const matchDomainCnames = (domainString) =>
  [...domainString.matchAll(domainRe)].map((m) => m.groups.domain);

// --- Initial Scan ---
docker.listContainers()
  .then((list) => {
    for (const cont of list) {
      if (cont.Labels["traefik.enable"] !== "true") continue;

      const keys = Object.keys(cont.Labels);
      keys.forEach((key) => {
        if (!re.test(key)) return;
        cnames = cnames.concat(matchDomainCnames(cont.Labels[key]));
      });
    }

    console.log("Initial CNAMEs:", cnames);
    fs.writeFileSync("cnames", cnames.join("\n"));

    // nodemon starten, überwacht cnames
    nodemon({
      watch: "cnames",
      script: "cname.py",
      execMap: { py: "python" },
    })
      .on("start", () => console.log("starting cname.py"))
      .on("restart", (files) =>
        console.log("restarting cname.py due to", files)
      );
  })
  .catch((err) => console.error("Error listing containers:", err));

// --- Live Events ---
docker
  .getEvents({ filters: { event: ["start", "stop"] } })
  .then((stream) => {
    let buffer = "";
    stream.setEncoding("utf8");

    stream.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop(); // letzte Zeile evtl. unvollständig

      for (const line of lines) {
        if (!line.trim()) continue;

        let eventJSON;
        try {
          eventJSON = JSON.parse(line);
        } catch (err) {
          console.error("Invalid JSON:", line);
          continue;
        }

        if (!["start", "stop"].includes(eventJSON.Action)) continue;

        const attrs = eventJSON.Actor?.Attributes || {};
        if (attrs["traefik.enable"] !== "true") continue;

        Object.keys(attrs).forEach((key) => {
          if (!re.test(key)) return;

          const hosts = matchDomainCnames(attrs[key]);
          if (!hosts.length) return;

          if (eventJSON.Action === "start") {
            cnames = cnames.concat(hosts);
            console.log("Adding", hosts);
          } else if (eventJSON.Action === "stop") {
            cnames = cnames.filter((h) => !hosts.includes(h));
            console.log("Removing", hosts);
          }

          fs.writeFileSync("cnames", cnames.join("\n"));
        });
      }
    });

    stream.on("error", (err) => console.error("Docker events stream error:", err));
  })
  .catch((err) => console.error("Failed to get Docker events:", err));
