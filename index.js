const Docker = require("dockerode")
const fs = require('fs')
const nodemon = require('nodemon')

const docker = new Docker({socketPath: "/var/run/docker.sock"});

const re = /traefik\.http\.routers\.(.*)\.rule/
const checkRe = /Host\(\s*`(.*?\.local)`\s*,*\s*\)/gi
const domainRe = /`(?<domain>[^`]*?\.local)`/g

let cnames = [];

const matchDomainCnames = function (domainString) {
	return [...domainString.matchAll(domainRe)].map(match => match.groups.domain)
}

docker.listContainers()
.then( list => {
  for (var i=0; i<list.length; i++) {
    var cont = list[i]
    if (cont.Labels["traefik.enable"] === "true") {
      var name = cont.Names[0].substring(1)
      var keys = Object.keys(cont.Labels)
      keys.forEach(key =>{
        if (re.test(key) && checkRe.test(cont.Labels[key])) {
          checkRe.lastIndex=0
          cnames = cnames.concat(matchDomainCnames(cont.Labels[key]))
        }
      })
    }
  }
  console.log(cnames)
  fs.writeFile("cnames",cnames.join('\n'), 'utf8', err => {}) 

  nodemon({
    watch: "cnames",
    script: "cname.py",
    execMap: {
      "py": "python"
    }
  })
  nodemon.on('start', function(){
    console.log("starting cname.py")
  })
  .on('restart', function(files){
    console.log("restarting cname.py with " + files)
  })
})
.then(() => {
  docker.getEvents({filters: { event: ["start", "stop"]}})
  .then( events => {
    events.setEncoding('utf8');
    events.on('data',ev => {
      var eventJSON = JSON.parse(ev)
      if(!['start', 'stop'].includes(eventJSON.status)){
        return;
      }
      
      var keys = Object.keys(eventJSON.Actor.Attributes)
      keys.forEach(key => {
        if (!re.test(key)) {
          return;
        }

        let hosts = matchDomainCnames(eventJSON.Actor.Attributes[key])
        if (!hosts.length) {
          return;
        }

        if (eventJSON.status === 'start') {
          cnames = cnames.concat(hosts)
          console.log('Adding', hosts);
        } else if (eventJSON.status === 'stop') {
          cnames = cnames.filter(host => !hosts.includes(host));
          console.log('Removing', hosts);
        }

        fs.writeFile("cnames",cnames.join('\n'),'utf8', err =>{})
      })
    })
  })
  .catch(err => {
    console.log(err)
  })
})

