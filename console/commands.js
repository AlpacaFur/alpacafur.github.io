var commands = {
  help: {
    "cmdex": "help (cmd)",
    "helpmsg":"Displays help messages for commands.",
    "acceptedFlags":["-d", "-h"],
    "acceptedParamFlags":[],
    "subcommands": false,
    "category": "Help",
    activate: (result)=>{
      if (!result.mainparam) {
        let longestFirst = 0
        let categories = {}
        for (let cmd in commands) {
          cmd = commands[cmd]
          if ((!cmd.debug || result.flags["-d"]) && (!cmd.hidden || result.flags["-h"])) {
            if (!cmd.category) cmd.category = "Uncategorized"
            if (categories[cmd.category]) categories[cmd.category].push(cmd)
            else categories[cmd.category] = [cmd]
            longestFirst = cmd.cmdex.length > longestFirst ? cmd.cmdex.length : longestFirst;
          }
        }
        for (let category in categories) {
          printHeader(category)
          categories[category].sort((a, b)=>{
            a = a.cmdex
            b = b.cmdex
            return (a > b) ? 1 : (a < b) ? -1 : 0
          })
          for (let cmd of categories[category]) {
            if ((!cmd.debug || result.flags["-d"]) && (!cmd.hidden || result.flags["-h"])) printLine(cmd.cmdex + " ".repeat((longestFirst - cmd.cmdex.length) + 5) + cmd.helpmsg)
          }
          printNewLine();
        }
      }
      else {
        let command = commands[result.mainparam]
        if (command) {
          let longestFirst = command.cmdex.length
          if (command.subcommands) {
            printNewLine();
            for (let cmd in command.subcommands) {
              cmd = command.subcommands[cmd]
              longestFirst = cmd.cmdex.length > longestFirst ? cmd.cmdex.length : longestFirst
            }
            printLine(command.cmdex + " ".repeat(longestFirst - command.cmdex.length + 5) + command.helpmsg)
            printNewLine();
            printHeader("Subcommand" + " ".repeat(longestFirst-10+5) + "Help Message")
            for (let cmd in command.subcommands) {
              cmd = command.subcommands[cmd]
              printLine(cmd.cmdex + " ".repeat((longestFirst - cmd.cmdex.length) + 5) + cmd.helpmsg)
            }
          }
          else {
            printLine(command.cmdex + " ".repeat(5) + command.helpmsg)
          }
        }
      }
    }
  },
  ls: {
    "cmdex": "ls",
    "helpmsg":"Lists files and folders in the current directory.",
    "acceptedFlags":[],
    "acceptedParamFlags": [],
    "subcommands":false,
    "category":"File System",
    activate:(result)=>{
      printLine(buildList(getLocalPathResults(currentPath, "")).join("\n"))
    }
  },
  cd: {
    "cmdex": "cd [path]",
    "helpmsg":"Changes the current directory.",
    "acceptedFlags":[],
    "acceptedParamFlags":[],
    "subcommands": false,
    "mainParamRequired": true,
    "category": "File System",
    activate:(result)=>{
      let folder = getLocalPathResults(result.mainparam, currentPath)
      if (folder && isFolder(folder)) {
        currentPath = parseLocalPath(result.mainparam, currentPath, true)
        promptdiv.innerHTML = `<span class="prompt">WebShell:${(currentPath.startsWith("~")?"":"/")+currentPath} $ </span>`
      }
      else {
        printLine("Directory not found.")
      }
    }
  },
  cat: {
    "cmdex": "cat [file]",
    "helpmsg":"Displays the content of a file.",
    "acceptedFlags":[],
    "acceptedParamFlags":[],
    "subcommands": false,
    "category": "File System",
    activate: (result)=>{
      if (localPathExists(result.mainparam, currentPath) && !(isFolder(getLocalPathResults(result.mainparam, currentPath)))) {
        let pathResults = getLocalPathResults(result.mainparam, currentPath)
        let results = result.mainparam.endsWith(".exe") || result.mainparam.endsWith(".dat") ? btoa(pathResults) : pathResults
        printLine(results)
      }
      else {
        printLine("File not found")
      }
    }
  },
  theme: {
    "cmdex": "theme (set|save|list) (-o|-c)",
    "helpmsg":"Allows you to set, save, and list themes or display the current theme.",
    "acceptedFlags": [],
    "acceptedParamFlags": [],
    "category": "Appearance",
    subcommands: {
      set: {
        "cmdex": "theme set [theme] (-o)",
        "helpmsg":"Sets the theme.",
        acceptedFlags: ["-o"],
        acceptedParamFlags: [],
        mainParamRequired: true,
        activate: (result) => {
          if (["reset","none","default"].includes(result.mainparam)) {switchTheme("default"); return;}
          if (result.flags["-o"] || themes.includes(result.mainparam)) {
            switchTheme(result.mainparam)
            printLine(result.flags["-o"] ? `Attempting to switch theme to "${result.mainparam}"` : `Switched theme to "${result.mainparam}"`)
          }
          else {
            printLine(`Theme "${result.mainparam}" not recognised`)
          }
        }
      },
      save: {
        "cmdex": "theme save (theme) (-o)",
        "helpmsg":"Saves your theme choice to local storage or the current theme.",
        acceptedFlags: ["-o"],
        acceptedParamFlags: [],
        activate: (result) => {
          if (!result.mainparam) {
            curTheme = document.getElementById("css").href.match(/themes\/(.+)\.css/)[1]
            localStorage.setItem("theme", curTheme)
            printLine(`Saved current theme: "${curTheme}"`)
          }
          else if (["reset","none","default"].includes(result.mainparam)) {switchTheme("default"); localStorage.removeItem("theme");}
          else if (result.flags["-o"] || themes.includes(result.mainparam)) {
            switchTheme(result.mainparam)
            localStorage.setItem("theme", result.mainparam);
            printLine(result.flags["-o"] ? `Attempting to save theme "${result.mainparam}"` : `Saved theme "${result.mainparam}"`)
          }
          else {
            printLine(`Theme "${result.mainparam}" not recognised`)
          }
        }
      },
      list: {
        "cmdex": "theme list (-c)",
        "helpmsg":"Lists recognised themes",
        acceptedFlags: ["-c"],
        acceptedParamFlags: [],
        mainParamRequired: false,
        async: true,
        activate: async (results)=>{
          if (results.flags["-c"]) {
            cmds = []
            let prevTheme = document.getElementById("css").href.match(/themes\/(.+)\.css/)[1]
            for (theme of themes) {
              switchTheme(theme)
              printLine(theme)
              await waitTime(3000)
            }
            switchTheme(prevTheme)
          }
          else {
            printLine(`Recognised themes: ${themes.join(", ")}`)
          }
        }
      }
    },
    activate: () => {
      printLine(`Current theme: "${document.getElementById("css").href.match(/themes\/(.+)\.css/)[1]}"`)
    }
  },
  fullscreen: {
    "cmdex": "fullscreen [true|false]",
    "helpmsg":"Attempts to fullscreen the console or exit fullscreen.",
    "acceptedFlags":[],
    "acceptedParamFlags":[],
    "subcommands": false,
    "mainParamRequired": true,
    "category": "Appearance",
    activate: (result)=>{
      if (["yes","y","true","on","activate"].includes(result.mainparam)) {
        document.documentElement.requestFullscreen();
      }
      else if (["no", "n", "false", "off", "exit"].includes(result.mainparam)) {
        document.exitFullscreen()
      }
      else {
        printLine("Invalid mode. Possible modes include true and false.")
      }
    }
  },
  clear: {
    "cmdex": "clear",
    "helpmsg":"Clears the console.",
    "acceptedFlags": [],
    "acceptedParamFlags": [],
    "subcommands": false,
    "category": "Appearance",
    activate: ()=>{
      clearConsole()
    }
  },
  run: {
    "cmdex": "run [file]",
    "helpmsg": "Runs an excecutable file.",
    "acceptedFlags": [],
    "acceptedParamFlags": [],
    "subcommands": false,
    "mainParamRequired": true,
    "category": "File System",
    activate: (results)=>{
      if (localPathExists(results.mainparam, currentPath) && !isFolder(results.mainparam, currentPath)) {
        if (results.mainparam.endsWith(".exe")) {
          try {
            eval(getLocalPathResults(results.mainparam, currentPath))
          }
          catch (e) {
            printError(`Error excecuting file: "${e}"`)
          }
        }
        else if (results.mainparam.endsWith(".dat")) {
          printNewLine()
          if (results.mainparam == "nether.dat") {
            let file = getLocalPathResults(results.mainparam, currentPath)
            file = file.replace(/([\[\]|_#]+)/g, "<span style='color:darkred;'>$1</span>")
            file = file.replace(/(\$+)/g, "<span style='color:darkorange;'>$1</span>")
            file = file.replace(/(\&+)/g, "<span style='color:yellow;'>$1</span>")
            printLine(file)
          }
          else if (results.mainparam == "level.dat") {
            let file = getLocalPathResults(results.mainparam, currentPath)
            file = file.replace(/\ (\*+)(\ |\n)/g, "<span style='color:green;'> $1$2</span>")
            file = file.replace(/\[\]/g, "<span style='color:brown;'>[]</span>")
            file = file.replace(/\&/g, "<span style='color:brown;'>&</span>")
            file = file.replace(/(\%+)/g, "<span style='color:RANDOM;'>$1</span>")
            file = file.replace(/([^#])(#+)([^#])/g, "$1<span style='color:grey;'>$2</span>$3")
            let oreColors = ["#B80711","tan","#B80711","tan","tan","#38DABB","tan","gold","gold"]
            let tempColors = oreColors.slice();
            while (file.match(/RANDOM/)) {
              let random = Math.floor(Math.random()*tempColors.length)
              file = file.replace(/RANDOM/, tempColors[random])
              tempColors.splice(random, 1)
              if (tempColors.length == 0) tempColors = oreColors.slice();
            }
            printLine(file)
          }
          printNewLine()
        }
        else {
          printLine("File not excecutable")
        }
      }
      else {
        printLine("File not found")
      }
    }
  },
  base64: {
    "cmdex": "base64 [-a ascii|-b base64]",
    "helpmsg": "Translates to and from base64. Specify input type with flags.",
    "acceptedFlags":["-a", "-b"],
    "acceptedParamFlags":[],
    "subcommands":false,
    "mainParamRequired":true,
    "category": "Utility",
    activate: (results)=>{
      if (!results.flags["-a"] && results.flags["-b"]) {
        try {
          let res = atob(results.mainparam)
          printLine(res)
        }
        catch(e) {
          printError("[Error]: Improperly encoded base64")
        }
      }
      else if (!results.flags["-b"] && results.flags["-a"]) {
        printLine(btoa(results.mainparam))
      }
      else {
        printLine("Please choose either translating to or from base64.")
      }
    }
  },
  home: {
    "cmdex": "home",
    "helpmsg": "Returns to website home page.",
    "acceptedFlags":[],
    "acceptedParamFlags":[],
    "subcommands":false,
    "category": "Utility",
    activate: ()=>{
      document.body.classList.add("fadeout")
      setTimeout(()=>{
        window.location.href = "/"
      }, 1000)
    }
  },
  clearhist: {
    "cmdex": "clearhist",
    "helpmsg": "Clears your command history.",
    "acceptedFlags": [],
    "acceptedParamFlags": [],
    "subcommands": false,
    "debug": true,
    "category": "Debug",
    activate: (results)=>{
      commandHistory = [];
      histPos = 0;
      printLine("Command history cleared.")
    }
  },
  error: {
    "cmdex": "error [message] (-t type)",
    "helpmsg":"Displays a debug error.",
    "acceptedFlags": [],
    "acceptedParamFlags": ["-t"],
    "subcommands": false,
    "mainParamRequired": true,
    "debug":true,
    "category": "Debug",
    activate: (result)=>{
      if (result.paramFlags["-t"]) {
        printError(`[${result.paramFlags["-t"]}]: ${result.mainparam}`)
      }
      else {
        printError(`[DebugError]: ${result.mainparam}`)
      }
    }
  },
  name: {
    "cmdex": "name",
    "helpmsg":"Displays the name of the console.",
    "acceptedFlags":[],
    "acceptedParamFlags":[],
    "subcommands": false,
    "debug":true,
    "category": "Debug",
    activate: ()=>{
      printLine(`<span class="intro">${name}</span>`)
    }
  },
  restart: {
    "cmdex": "restart",
    "helpmsg":"Reloads the page.",
    "acceptedFlags":[],
    "acceptedParamFlags":[],
    "subcommands": false,
    "debug": true,
    "category": "Debug",
    activate: ()=>{
      location.reload();
    }
  },
  reset: {
    "cmdex": "reset",
    "helpmsg":"Resets all settings and flags",
    "acceptedFlags":[],
    "acceptedParamFlags":[],
    "debug":true,
    "category":"Debug",
    activate: ()=>{
      localStorage.removeItem("theme");
      localStorage.removeItem("name");
      window.location.href = window.location.pathname
    }
  },
  settings: {
    "cmdex": "settings [setting] (-v value)",
    "helpmsg":"Sets the value of a setting.",
    "acceptedFlags":[],
    "acceptedParamFlags":["-v"],
    "debug":true,
    "category":"Debug",
    "mainParamRequired":true,
    activate: (results)=>{
      let settings = []
      if (results.mainparam == "theme") {
        printLine(`Use "theme save [theme]" instead.`)
      }
      else if (!results.paramFlags["-v"]) {
        if (["name"].includes(results.mainparam)) {
          printLine(`Current Value: ${localStorage.getItem(results.mainparam)}`)
        }
      }
      else {
        if (["name"].includes(results.mainparam)) {
          localStorage.setItem(results.mainparam, results.paramFlags["-v"]);
        }
      }
    }
  },
  ss: {
    "cmdex": "ss [name]",
    "helpmsg": "Shortcut to specific directories",
    "acceptedFlags":[],
    "acceptedParamFlags":[],
    "mainParamRequired":true,
    "subcommands":false,
    "category": "Hidden",
    "hidden": true,
    activate: (result)=>{
      let res = {};
      switch (result.mainparam) {
        case "secret":
          res.mainparam = "/MainDisk/Users/user/Documents/Secret/SuperSecret/TOP_SECRET"
          break;
        case "gamesaves":
          res.mainparam = "/USB_DRIVE/Backups/Game_Saves/"
          break;
        case "w":
          res.mainparam = "/USB_DRIVE/Backups/Game_Saves/minecraft/World_One"
          break;
        case "d":
          commands.run.activate({mainparam:"~/Applications/discord.exe"})
          break;
        default:
          printLine(`Shortcut "${result.mainparam}" is not recognised.`)
      }
      if (res.mainparam) commands.cd.activate(res);
    }
  }
}
