var fileSystem = {"MainDisk":{
                    "Users":{
                      "user":{
                        "Documents":{
                          "test.txt":"Hello, World",
                            "Secret":{
                              "SuperSecret":{
                                "TOP_SECRET":{
                                  "secret.a":"<a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ'>Secret</a>",
                                  "about.md":"#### WebShell ####\nCreated By: AlpacaFur\n\naGVscCAtcw==",
                                  "debug.info":"ctrl + ` restores prompt functionality regardless of the situation. May break the code.\nUse help -d to list commands including debug commands."
                                }
                              }
                            }
                          },
                        "Downloads":{
                          "notavirus.exe":"function flash(){document.body.style.backgroundColor='red',setTimeout(()=>{document.body.style.backgroundColor=''},100)}flash(),setTimeout(()=>{alert('HI THERE!!!');hidePrompt();},300),setTimeout(flash,1e3),setTimeout(flash,3e3),setTimeout(flash,4e3),setTimeout(flash,6e3),setTimeout(flash,7e3),setTimeout(flash,9e3),printError('[CRITICAL ERROR]: VIRUS DETECTED, ATTEMPTING REMOVAL'),printLine(`<span class='error'>REMOVING VIRUS: [=>              ]0%</span>`),asyncLoadingBar(700).then(()=>{printSuccess('[INFO]: VIRUS REMOVED');printSuccess('[INFO]: SHELL FUNCTIONALITY RESTORED');promptdiv.scrollIntoView();showPrompt();});",
                          "virus.exe":"switchTheme('s/virus')",
                          "antivirus.exe":"switchTheme(localStorage.getItem('theme') || 'default')",
                          "hello.txt":"HI THERE!",
                          "hello(1).txt":"HI THERE!",
                          "hello(2).txt":"HI THERE!",
                          "hello(3).txt":"HI THERE!",
                          "hello(4).txt":"HI THERE!"
                        },
                        "Applications":{
                          "discord.exe":`discordApplication()`,
                          "skype.exe":`printError("[ApplicationError]: Skype.exe has encountered a problem and stopped working. (It's probably for the best anyway...)")`
                        }
                      }
                    }
                  },
                  "USB_DRIVE":{
                    "Backups":{
                      "Game_Saves":{
                        "CivV":{
                          "InSovietRussia.civ":"TV watch you.",
                          "InCapitalistAmerica.civ":"Bank rob you."
                        },
                        "minecraft": {"World_One":
                                      {"level.dat":`@@@@@     @@@@         @@@@@\n@@@      @@@@@@@          @@@@\n        @@@\n                 **              **\n               ******          ******\n               ******          ******\n                 []     ____     []\n____       ______[]____|####|____[]\n####|_____|##########################|\n#######################################|\n#######################################|\n#####%%%##################|\n######%%%%##########%%%|     __________\n####################%%#|____|##########|\n#######################################|\n#######################################|\n#######################################|\n&&&&&&&&&&#######%%%###################|\n[]   []   #######################%%####|\n[]   []   #############################|\n[]_#_[]___#############################|\n#######################%%%#############|\n####%%################%%###############|\n#####%%%###############################|\n#######################################|`,
                                      "nether.dat":`########################################\n&&&&   $   ###########         $    &&\n&&     $       &&&&            $     &&\n       $         &&            $\n       $                       $\n       $                       $\n       $                       $\n       $                       $\n       $                       $\n       $                       $\n       $                       $\n       $                       $     \n_______$_______________________$______\n#######$##############################|\n#######$##############################|\n       $  [#]            [#]   $\n       $  [#]            [#]   $\n       $  [#]            [#]   $\n       $  [#]            [#]   $\n       $  [#]            [#]   $\n       $  [#]  ####      [#]   $$\n##$$$$$$$$[#########$$$$$[#]$$$$$$$$$$$#\n###$$$$$$$[#################$$$$$$$$$$##\n####$$$$$$###################$$$$$$$$###\n########################################`
                                      }
                        }
                      }
                    }
                  }
        }
tempFilesystem = {
  "test": {
    "test.txt":"Hello",
    "ok.thing":"doubleok",
    "object.test":{isFile:true,content:"HELLO"}
  }
}
var homeFolder = "MainDisk/Users/user"
var currentPath = "MainDisk/Users/user"
//##################### REMOVE WHEN DONE TESTING
// fileSystem = tempFilesystem
// homeFolder = "test"
// currentPath = ""
//#####################


function isFile(fileobject) {
  return typeof fileobject == "string" || fileobject.isFile
}
function isFolder(fileobject) {
  return !(typeof fileobject == "string" || fileobject.isFile);
}
function parseFile(fileobject) {
  if (typeof fileobject == "string") {
    return {isFile:true,content:fileobject,excecutable:false}
  }
  else {
    return fileobject;
  }
}

function getFileInfo(ogpath) {
  let path = ogpath.split("/")
  let file = path.pop()
  let results = getLocalPathResults(path.join("/"),currentPath)
  if (!results) return false;
  return {name:file,file:results[file],path:ogpath}
}
function localPathExists(path, currentPath) {
  return !!getLocalPathResults(path, currentPath)
}
function parseLocalPath(path, currentPath, display) {
  if (path.startsWith("~")) {
    path = path.slice(1)
    currentPath = ""
    path = homeFolder + path
  }
  if (path.startsWith("/")) {
    path = path.slice(1)
    currentPath = ""
  }
  if (path.startsWith("..") && currentPath != "") {
    path = path.slice(2)
    currentPath = currentPath.split("/")
    currentPath.pop()
    currentPath = currentPath.join("/")
    path += currentPath
    currentPath = ""
  }
  if (currentPath != "") path = currentPath + "/" + path;
  if (path.endsWith("/")) path = path.slice(0,-1);
  if (path.startsWith(homeFolder) && display) {
    path = path.slice(homeFolder.length)
    path = "~" + path
  }
  return path;
}
function getLocalPathResults(path, currentPath) {
  path = parseLocalPath(path, parseLocalPath(currentPath, ""), false).split("/")
  return recursivePathAccess(path, fileSystem);
}
function recursivePathAccess(path, files) {
  if (path == "") return files;
  if (path.length == 1) return files[path[0]];
  let dir = path.shift()
  if (!files[dir]) return false;
  return recursivePathAccess(path, files[dir])
}
