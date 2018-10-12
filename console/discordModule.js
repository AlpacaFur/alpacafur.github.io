var discordLogins = { "AlpacaFur#3093":"youlookedatthecode!",
                      "Admin#1337":"rosebud",
                      "User#1234":"1234",
                      "Memelord#0069":"memesaremylife",
                      "CoolKid#0420":"secretlynotcool",
                      "HeyThere#1382":"wellmet",
                      "TheIlluminati#0666":"illuminaticonfirmed"}

function exitDiscord() {
  promptdiv.innerHTML = `<span class="prompt">WebShell:${parseLocalPath(currentPath,"",true)} $ </span>`;
  currentApplication = {}
  input.style.display = "unset"
  clearConsole()
  showPrompt();
}
function displayChannel() {
  clearConsole();
  let server = currentApplication.data.server
  let channel = currentApplication.data.channel
  let serverobj = discordServers[server]
  let channelobj = serverobj.channels[channel]
  printHeader(channel)
  for (let message of channelobj.messages) {
    let user = serverobj.users[message.user]
    let userrole = user.roles[0]
    appendLine(`<span style="color:${serverobj.roles[userrole] || "grey"};font-weight:bold;">${message.user}: </span>`)
    appendLine(message.message)
    printNewLine()
  }
}
function postMessage(text) {
  let server = currentApplication.data.server
  let channel = currentApplication.data.channel
  let roles = discordServers[server].users[currentApplication.data.username].roles
  let channelTalkPerms = discordServers[server].channels[channel].talkperms;
  if (!channelTalkPerms || channelTalkPerms.some((role)=>{return roles.includes(role)})) {
    discordServers[server].channels[channel].messages.push({user:currentApplication.data.username, message:stylePost(text)})
    displayChannel()
  }
  else {
    displayChannel()
    printError("You don't have permission to talk in this channel.")
  }
}
function stylePost(text) {
  text = text.replace(/(\ |^)(\#\w+)(\ |$)/g, `$1<a href="$2">$2</a>$3`)
  text = text.replace(/(\ |^)(\@\w+\#\d{4})(\ |$)/g, `$1<a href="#$2">$2</a>$3`)
  return text;
}
function displayServer() {
  clearConsole()
  let server = currentApplication.data.server
  let serverobj = discordServers[server]
  printHeader(server)
  for (let channel in serverobj.channels) {
    printLine(channel)
  }
}
function displayAccount() {
  let user = currentApplication.data.username
  clearConsole()
  printHeader(user)
  printNewLine()
  printHeader("Servers:")
  for (let server in discordServers) {
    let serverobj = discordServers[server]
    if (serverobj.users[user]) {
      printLine(server)
    }
  }
}
function discordHandler(text) {
  if (currentApplication.state == "loginusername") {
    currentApplication.data.username = text;
    printHeader("Password:")
    currentApplication.state = "loginpassword";
    input.style.display = "none"
    currentApplication.hiddenInput = true;
  }
  else if (currentApplication.state == "loginpassword") {
    showPrompt();
    currentApplication.hiddenInput = false;
    input.style.display = "unset"
    if (discordLogins[currentApplication.data.username] == text) {
      printHeader(`Login Successful! Welcome ${currentApplication.data.username}`)
      currentApplication.state = "loggedin"
      displayAccount()
    }
    else {
      printError("Username or password is incorrect. Press ctrl+c to exit.")
      printHeader("Username:")
      currentApplication.state = "loginusername"
    }
  }
  else {
    if (text == "/help") {
      
    }
    if (text == "/exit") {
      switch (currentApplication.state) {
        case "loggedin":
          currentApplication.state = "loginusername"
          currentApplication.username = undefined;
          discordApplication()
          break;
        case "inserver":
          currentApplication.state = "loggedin"
          currentApplication.data.server = undefined;
          displayAccount()
          break;
        case "inchannel":
          currentApplication.state = "inserver"
          currentApplication.data.channel = undefined;
          displayServer()
          break;
        default:
      }
    }
    if (text.startsWith("/server")) {
      let server = text.split(" ")
      server.shift()
      server = server.join(" ")
      if (server.length > 0 && discordServers[server] && discordServers[server].users[currentApplication.data.username]) {
        currentApplication.data.server = server
        currentApplication.state = "inserver"
        displayServer()
      }
      else {
        printLine("Server not recognised.")
      }
    }
    else if (text.startsWith("/channel")) {
      if (currentApplication.data.server) {
        let server = currentApplication.data.server
        let channel = text.split(" ")
        channel.shift()
        channel = channel.join(" ")
        if (channel.length > 0 && discordServers[server].channels[channel]) {
          currentApplication.data.channel = channel
          currentApplication.state = "inchannel"
          displayChannel()
        }
        else {
          printLine("Channel not recognised.")
        }
      }
      else {
        printLine("You need to be in a server to enter a channel.")
      }
    }
    else if (currentApplication.data.channel) {
      postMessage(text)
    }
    currentApplication.history.commands.push(text)
    currentApplication.history.position = currentApplication.history.commands.length;
  }
  showPrompt();
}

function discordApplication() {
  hidePrompt()
  clearConsole();
  currentApplication = {}
  currentApplication.active = true;
  currentApplication.handler = discordHandler;
  currentApplication.exit = exitDiscord;
  currentApplication.data = {}
  currentApplication.history = {}
  currentApplication.history.position = 0
  currentApplication.history.commands = []
  promptdiv.innerHTML = `<span class="prompt">$: </span>`;
  printHeader("Username:")
  currentApplication.state = "loginusername";
  showPrompt()
}

discordServers = {
  "Discord Admins":{
    "roles": {"Member":"dodgerblue","Owner":"#7289DA"},
    "users": {"Admin#1337":{roles:["Owner"]}, "AlpacaFur#3093":{roles:["Member"]}},
    "channels":{
      "#welcome":{talkperms:["Owner"],
        messages:
        [ {user:"Admin#1337",message:"Welcome to the server!"},
          {user:"Admin#1337",message:"You can find some information in #information"},
          {user:"Admin#1337",message:"You can find the server rules in #rules"},
          {user:"Admin#1337",message:"Other than that, have fun!"} ]
      },
      "#rules":{talkperms:["Owner"],
        messages:
        [ {user:"Admin#1337",message:"1. Keep spam to a minimum"},
          {user:"Admin#1337",message:"2. Be respectful to all members and staff"},
          {user:"Admin#1337",message:"3. Generally, don't do dumb stuff"},
          {user:"Admin#1337",message:"Other than that, have fun!"} ]
      },
      "#general":{talkperms:false,
        messages:
        [ {user:"Admin#1337",message:"You can talk in here."} ]
      }
    }
  },
  "Cool Kids":{
    "roles": {"Member":"Yellow","Owner":"Red"},
    "users": {"Admin#1337":{roles:["Member"]}, "AlpacaFur#3093":{roles:["Member"]},"CoolKid#0420":{roles:["Owner"]}},
    "channels":{
      "#welcome":{talkperms:["Owner"],
        messages:
        [ {user:"CoolKid#0420",message:"Welcome to the server!"},
          {user:"CoolKid#0420",message:"Have fun!"} ]
      },
      "#rules":{talkperms:["Owner"],
      messages:
        [ {user:"CoolKid#0420",message:"1. BE COOL"},
          {user:"CoolKid#0420",message:"2. DON'T BE UNCOOL"} ]
      },
      "#general":{talkperms:false,
      messages:
      [ {user:"CoolKid#0420",message:"You can talk in here."} ]
      }
    }
  },
  "Memes and Stuff":{
    "roles": {"Memeber":"Orange","Owner":"Green"},
    "users": {"Memelord#0069":{roles:["Owner"]},"AlpacaFur#3093":{roles:["Memeber"]},"User#1234":{roles:["Memeber"]},"HeyThere#1382":{roles:["Memeber"]}},
    "channels":{
      "#welcome":{talkperms:["Owner"],
        messages:
        [ {user:"Memelord#0069",message:"Welcome to the server!"},
          {user:"Memelord#0069",message:"You can find some information in #information"},
          {user:"Memelord#0069",message:"You can find the server rules in #rules"},
          {user:"Memelord#0069",message:"Other than that, have fun!"} ]
      },
      "#rules":{talkperms:["Owner"],
        messages:
        [ {user:"Memelord#0069",message:"1. Keep spam to a MAXIMUM"},
          {user:"Memelord#0069",message:"2. Be ok to all members and staff"},
          {user:"Memelord#0069",message:"3. Generally, don't do really dumb stuff"},
          {user:"Memelord#0069",message:"Other than that, have fun!"} ]
      },
      "#general":{talkperms:false,
        messages:
        [ {user:"Memelord#0069",message:"You can talk in here."},
          {user:"Memelord#0069",message:"In Soviet Russia, pushup do you."},
          {user:"Memelord#0069",message:"In Capitalist America, bank robs you."},
          {user:"HeyThere#1382",message:"Haha"} ]
      }
    }
  },
}
