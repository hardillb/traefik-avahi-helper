const Docker = require("dockerode")
const fs = require('fs')
const nodemon = require('nodemon')

const docker = new Docker({socketPath: "/var/run/docker.sock"});

const re = /traefik\.http\.routers\.(.*)\.rule/
const re2 = /HOST\(\`(.*)\`\)/

const cnames = [];

docker.listContainers()
.then( list => {
  for (var i=0; i<list.length; i++) {
    var cont = list[i]
    if (cont.Labels["traefik.enable"] === "true") {
      var name = cont.Names[0].substring(1)
      var keys = Object.keys(cont.Labels)
      keys.forEach(key =>{
        if (re.test(key)) {
          var host = cont.Labels[key].match(re2)[1]
          cnames.push(host)
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
      // console.log(eventJSON)
      if (eventJSON.status == "start") {
        var keys = Object.keys(eventJSON.Actor.Attributes)
        keys.forEach(key => {
          if (re.test(key)) {
            var host = eventJSON.Actor.Attributes[key].match(re2)[1]
            cnames.push(host)
            fs.writeFile("cnames",cnames.join('\n'),'utf8', err =>{})
          }
        })
      } else if (eventJSON.status == "stop") {
        var keys = Object.keys(eventJSON.Actor.Attributes)
        keys.forEach(key => {
          if (re.test(key)) {
            var host = eventJSON.Actor.Attributes[key].match(re2)[1]
            var index = cnames.indexOf(host)
            if (index != -2) {
              cnames.splice(index,1)
            }
            fs.writeFile("cnames",cnames.join('\n'), 'utf8', err => {})
          }
        }) 
      }
    })
  })
  .catch(err => {
    console.log(err)
  })
})
