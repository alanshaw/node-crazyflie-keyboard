var Aerogel = require('aerogel');

var driver = new Aerogel.CrazyDriver();
var copter = new Aerogel.Copter(driver);

driver.findCopters()
.then(function(copters)
{
  console.log(copters)
    if (copters.length === 0)
    {
        console.error('No copters found! Is your copter turned on?');
        process.exit(1);
    }

    var uri = copters[0];
    console.log('Using copter at', uri);
    return uri;
})
.then(function(uri) { return copter.connect(uri); })
.then(function() { console.log("Ready"); ready = true; })
.done();

var stdin = process.stdin
  , ready = false

// without this, we would only get streams once enter is pressed
stdin.setRawMode(true)

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume()

// i don't want binary, do you?
stdin.setEncoding("utf8")

// on any data into stdin
stdin.on("data", function (key) {
  // ctrl-c (end of text)
  if (key === "\u0003") return exit()
  
  if (!ready) {
    console.warn("Copter not ready!")
    return
  }
  
  switch (key) {
    case "t": 
      console.log("take off...")
      copter.takeoff().then(function () {
        copter.hover()
      }).then(function () {
        ready = true
      })
      break;
    case "l":
      console.log("land...")
      ready = false
      copter.land().then(function () {
        ready = true
      })
      break;
    case "h":
      console.log("hover...")
      copter.hover()
      break;
    case "\u001b[A": // Up
      console.log("up...")
      copter.setPitch(25)
      copter.setRoll(0)
      break;
    case "\u001b[B": // Down
      console.log("down...")
      copter.setPitch(-25)
      copter.setRoll(0)
      break;
    case "\u001b[D": // Left
      console.log("left...")
      copter.setPitch(0)
      copter.setRoll(25)
      break;
    case "\u001b[C": // Right
      console.log("right...")
      copter.setPitch(0)
      copter.setRoll(-25)
      break;
    default: console.log("Unkown command %s", key)
  }
})

process.on('SIGINT', exit);

// Graceful(ish) exit
function exit () {
  copter.land()
  copter.shutdown()
  process.exit()
}