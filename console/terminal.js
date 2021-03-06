"use strict";
var name = `\
888       888          888       .d8888b.  888               888 888
888   o   888          888      d88P  Y88b 888               888 888
888  d8b  888          888      Y88b.      888               888 888
888 d888b 888  .d88b.  88888b.   "Y888b.   88888b.   .d88b.  888 888
888d88888b888 d8P  Y8b 888 "88b     "Y88b. 888 "88b d8P  Y8b 888 888
88888P Y88888 88888888 888  888       "888 888  888 88888888 888 888
8888P   Y8888 Y8b.     888 d88P Y88b  d88P 888  888 Y8b.     888 888
888P     Y888  "Y8888  88888P"   "Y8888P"  888  888  "Y8888  888 888`
var terminal = document.getElementById("console-text");
var input = document.getElementById("input");
var caret = document.getElementById("caret")
var promptdiv = document.getElementById("prompt")
var themes = ["default", "light", "green", "red", "powershell"]
var cursorpos = 0
var commandHistory = []
var histPos = 0
var visible = false;

var currentApplication = {};

document.addEventListener("keydown", (e)=>{
  if (e.key == "c" && e.ctrlKey) currentApplication.exit();
  if (e.key == "`" && e.ctrlKey){ showPrompt(); printLine("Prompt restored."); return;}
  if (!visible) return;
  if (["Shift","CapsLock","Control","Alt","Meta","Escape","Dead"].includes(e.key) || e.key.match(/F\d+/)) return;
  if (e.key.match(/Arrow.+/)) {
    e.preventDefault();
    switch (e.key) {
      case "ArrowLeft":
        if (e.ctrlKey || e.metaKey) {
          caret.style.left = `-${(input.innerText.length)*(input.offsetWidth/input.innerText.length)}px`
          cursorpos = 0;
        }
        else {
          moveCaret("left")
        }
        break;
      case "ArrowRight":
        if (e.ctrlKey || e.metaKey) {
          caret.style.left = "0px"
          cursorpos = input.innerText.length
        }
        else {
          moveCaret("right")
        }
        break;
      case "ArrowUp":
        history("back")
        break;
      case "ArrowDown":
        history("forward")
        break;
    }
    promptdiv.scrollIntoView();
    return;
  }
  switch (e.key) {
    case "Enter":
      submit();
      break;
    case "Backspace":
      if(e.ctrlKey || e.metaKey) {
        input.innerHTML = highlightFirstWord(input.innerText.slice(cursorpos))
        cursorpos = 0
      }
      else {
        backspace();
      }
      break;
    case "Tab":
      if (cursorpos != input.innerText.length) return;

      e.preventDefault()
      input.innerHTML = highlightFirstWord(autoComplete(input.innerText));
      cursorpos = input.innerText.length;

      break;
    case "v":
      if(e.ctrlKey | e.metaKey) {
        navigator.clipboard.readText()
        .then(text => {
          type(text);
        })
      }
      else {
        type(e.key)
      }
      break;
    default:
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        type(e.key)
      }
  }
  promptdiv.scrollIntoView();
})

function autoComplete(input) {
  input = input.split(" ")
  if (input.length < 2) return;
  let path = input.pop()
  let chunkIndex = path.lastIndexOf("/");
  let lastItem;
  if (chunkIndex != -1) {
    lastItem = path.slice(chunkIndex+1)
    path = path.slice(0, chunkIndex+1)
  }
  else {
    lastItem = path;
    path = "";
  }
  let results = getLocalPathResults(path.length > 0 ? path : "", currentPath)
  if (!results) return;
  let autocomplete = [];
  for (let item in results) {
    if (item.startsWith(lastItem)) autocomplete.push(item);
  }
  if (autocomplete.length == 1) {
    return input.join(" ") + " " + path + autocomplete[0]
  }
}

function printLine(text) {
  terminal.innerHTML += text + "\n";
}
function appendLine(text) {
  terminal.innerHTML += text
}
function printHeader(text) {
  terminal.innerHTML += `<span class="header">${text}</span>\n`
}
function printError(text) {
  terminal.innerHTML += `<span class="error">${text}</span>\n`
}
function printSuccess(text) {
  terminal.innerHTML += `<span class="success">${text}</span>\n`
}
function printNewLine() {
  terminal.innerHTML += "\n";
}
function hidePrompt() {
  document.getElementById("inputline").style.display = "none"
  visible = false;
}
function showPrompt() {
  document.getElementById("inputline").style.display = ""
  visible = true;
  promptdiv.scrollIntoView();
}
function clearConsole() {
  terminal.innerHTML = "";
}
function updatePrompt() {
  let path = parseLocalPath("", currentPath, true)
  promptdiv.innerHTML = `<span class="prompt">WebShell:${(path.startsWith("~")?"":"/")+path} $ </span>`
}
function backspace() {
  if (input.innerText != "" && cursorpos != 0) {
    let text = input.innerText;
    text = text.slice(0, cursorpos-1) + text.slice(cursorpos)
    text = highlightFirstWord(text)
    input.innerHTML = text;
    cursorpos--;
  }
}
function type(text) {
  if (input.innerText.length == 0 || cursorpos == input.innerText.length) {
    let temp = input.innerText + text
    temp = highlightFirstWord(temp)
    input.innerHTML = temp
  }
  else {
    let itext = input.innerText;
    itext = highlightFirstWord(itext.slice(0, cursorpos) + text + itext.slice(cursorpos))
    input.innerHTML = itext
  }
  cursorpos+=text.length;
}
function moveCaret(dir) {
  let charsize = input.offsetWidth/input.innerText.length
  if (dir == "right" && cursorpos != input.innerText.length) {
      caret.style.left = `-${(input.innerText.length - cursorpos-1)*charsize}px`
      cursorpos++;
  }
  else if (dir == "left" && cursorpos != 0) {
    caret.style.left = `-${(input.innerText.length - cursorpos+1)*charsize}px`
    cursorpos--;
  }
}
function history(dir) {
  if (dir == "back") {
    if (!currentApplication.active && histPos != 0) {
      histPos--;
      input.innerHTML = highlightFirstWord(commandHistory[histPos])
    }
    else if (currentApplication.active && currentApplication.history && currentApplication.history.position != 0) {
      currentApplication.history.position--;
      input.innerHTML = highlightFirstWord(currentApplication.history.commands[currentApplication.history.position])
    }
  }
  else if (dir == "forward") {
    if (currentApplication.active && currentApplication.history && currentApplication.history.position >= currentApplication.history.commands.length-1) {
      input.innerHTML = "";
      currentApplication.history.position = currentApplication.history.commands.length;
    }
    else if (currentApplication.active && currentApplication.history){
      currentApplication.history.position++;
      input.innerHTML = highlightFirstWord(currentApplication.history.commands[currentApplication.history.position])
    }
    else if (histPos >= commandHistory.length-1) {
      input.innerHTML = "";
      histPos = commandHistory.length;
    }
    else {
      histPos++;
      input.innerHTML = highlightFirstWord(commandHistory[histPos])
    }
  }
  cursorpos = input.innerText.length;
}

function highlightFirstWord(text) {
  return text.replace(/^([^\s]+)(\s?)/, '<span class="first-word">$1</span>$2')
}

function buildList(files) {
  if (!files) return [];
  let obj = {col1:0,col2:0,col3:0}
  let col = 1
  for (let file of Object.keys(files)) {
    if (isFolder(files[file])) file += "/"
    obj["col"+col] = file.length > obj["col"+col] ? file.length : obj["col"+col]
    col++;
    if (col == 4) col = 0;
  }
  col = 1
  let rows = []
  let currentrow = ""
  for (let file of Object.keys(files)) {
    let afile;
    if (isFolder(files[file])) {
      file += "/"
      afile = `<span class="folder">${file}</span>`
    }
    else {
      afile = `<span class="file">${file}</span>`
    }
    currentrow += afile + " ".repeat(obj["col"+col] - file.length + 5)
    col++
    if (col == 4) {
      rows.push(currentrow)
      currentrow = ""
      col = 1
    }
  }
  if (currentrow) rows.push(currentrow)
  return rows;
}



function switchTheme(theme) {
  document.getElementById("css").href = "themes/" + theme + ".css"
}
function queryParse () {
  let urlParams = new URLSearchParams(window.location.search);
  let object = {};
  let theme = urlParams.get('theme')
  try {
    if (theme) {
      switchTheme(theme);
    }
    else if (!(localStorage.getItem("theme") === null)) {
      switchTheme(localStorage.getItem("theme"))
    }
  }
  catch(e) {}
  object.skipLoad = !!urlParams.get('skipLoad');
  return object;
}



function waitTime(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function asyncLoadingBar(timeout) {
  let consoletextt = terminal.innerHTML;
  consoletextt = consoletextt.split("\n")
  consoletextt.pop()
  let lastlinet = consoletextt.pop()
  if (lastlinet.match(/\[((=*)&gt;)\ +\](\d+)%/)) {
    let lastline = lastlinet
    while (lastline.match(/\[((=*)&gt;)\ +\](\d+)%/)) {
      let consoletext = terminal.innerHTML;
      consoletext = consoletext.split("\n")
      consoletext.pop()
      lastline = consoletext.pop()
      let match = lastline.match(/\[((=*)&gt;)(\ +)\]/)
      let bar = `[${"=".repeat(match[2].length+1)}&gt;${" ".repeat(match[3].length-1)}]`
      lastline = lastline.replace(/\[((=*)&gt;)\ +\](\d+)%/, bar + Math.floor(match[2].length/(match[0].length-6)*100) + "%")
      terminal.innerHTML = consoletext.join("\n") + "\n" + lastline + "\n"
      await waitTime(timeout);
    }
    consoletextt = terminal.innerHTML;
    consoletextt = consoletextt.split("\n")
    consoletextt.pop()
    lastlinet = consoletextt.pop()
    let match = lastlinet.match(/\[((=*)&gt;)\](\d+)%/)
    let bar = `[${"=".repeat(match[2].length+1)}]`
    lastline = lastline.replace(/\[((=*)&gt;)\](\d+)%/, bar + "100%")
    terminal.innerHTML = consoletextt.join("\n") + "\n" + lastline + "\n"
    return;
  }
}


async function queueLoading(messages, timeout) {
  let temp;
  for (let msg of messages) {
    printLine(msg)
    await asyncLoadingBar(timeout);
  }
}

function parseCommand(cmdparts, command) {
  let result = {paramFlags:{}, flags:{}};
  cmdparts = cmdparts.split(" ")
  result.command = cmdparts.shift()
  cmdparts = cmdparts.join(" ");
  let failsafe = 0
  while (cmdparts.length >= 1 && failsafe < 1000) {
    if (cmdparts.match(/^([^-"][^\s\n\r"]*)(\s|$)/)) {
      if (result.subcommand) {
        if(!result.mainparam) result.mainparam = "";
        result.mainparam += cmdparts.match(/^([^-"][^\s\n\r"]*)(\s|$)/)[1];
      }
      else {
        result.subcommand = cmdparts.match(/^([^-"][^\s\n\r"]*)(\s|$)/)[1]
      }
      cmdparts = cmdparts.replace(/^([^-"][^\s\n\r"]*)(\s|$)/, "")
    }
    else if (cmdparts.match(/^"[^"]+"(\s|$)/)) {
      result.mainparam = cmdparts.match(/"([^"]+)"\s?\s?/)[1]
      cmdparts = cmdparts.replace(/"[^"]+"\s?/, "")
    }
    else if (cmdparts.match(/^(-\w)(?:\s-\w|$)/)) {
      result.flags[cmdparts.match(/^(-\w)(?:\s-\w|$)/)[1]] = true;
      cmdparts = cmdparts.replace(/^(-\w)\s?/, "")
    }
    else if (cmdparts.match(/^(-.)(\s(\w+|"([^"\n\r])+")(\s|$))/)) {
      let match = cmdparts.match(/(-.)(?:\s(?:(\w+)|"((?:[^"\n\r])+)")(?:\s|$))/)
      result.paramFlags[match[1]] = match[2] || match[3]
      cmdparts = cmdparts.replace(/(-.)(?:\s(\w+|"(?:[^"\n\r])+")(?:\s|$))/, "")
    }
    failsafe++;
  }
  if (failsafe >= 1000) {
    console.log(`[Error]: FAILSAFE EXCEEDED Debug Info: "${cmdparts}"`);
    printError("[Error]: Error parsing that command.")
    result = false;
  }
  return result;
}

function runCommand(cmd, result, text) {
  if (!cmd.mainParamRequired || result.mainparam) {
    let check = checkFlags(cmd, result)
    if (check.success) {
      if (cmd.async) {
        cmd.activate(result).then(()=>{
          commandHistory.push(text)
          histPos = commandHistory.length;
          showPrompt();
        })
      }
      else {
        cmd.activate(result);
        commandHistory.push(text)
        histPos = commandHistory.length;
        showPrompt();
      }
    }
    else {
      printLine(`Unrecognised flags: ${check.errors.join(", ")}, use "help ${result.command}" for more info.`)
      showPrompt();
    }
  }
  else {
    printLine(`Command requires a main parameter. Use "help ${result.command}" for more info.`)
    showPrompt();
  }
  histPos = commandHistory.length;
}


function submit() {
  hidePrompt();
  let text = input.innerText
  input.innerHTML = "";
  appendLine(promptdiv.innerHTML)
  if (!currentApplication.hiddenInput) appendLine(highlightFirstWord(text));
  appendLine("\n")
  cursorpos = 0;
  caret.style.left = "0px"
  if (currentApplication.active) {currentApplication.handler(text);return;}
  let result = parseCommand(text.trim())
  if (commands[result.command]) {
    let cmd = commands[result.command]
    if (result.subcommand) {
      if (cmd.subcommands) {
        if (cmd.subcommands[result.subcommand]) {
          runCommand(cmd.subcommands[result.subcommand], result, text)
        }
        else {
            printLine(`Command "${result.command}" does not have a subcommand "${result.subcommand}"`)
            showPrompt();
        }
      }
      else if (!result.mainparam) {
        result.mainparam = result.subcommand;
        runCommand(cmd, result, text)
      }
      else {
        printLine(`"${result.command}" doesn't have any subcommands`)
        showPrompt();
      }
    }
    else {
      runCommand(cmd, result, text)
    }
  }
  else if (result.command == "") {showPrompt(); return;}
  else {
    printLine(`Unknown Command: "${result.command}"`)
    showPrompt();
  }
}
function checkFlags(cmd, result) {
  let errors = []
  for (let flag of Object.keys(result.flags)) {
    if (!cmd.acceptedFlags.includes(flag)) errors.push(flag);
  }
  for (let paramFlag of Object.keys(result.paramFlags)) {
    if (!cmd.acceptedParamFlags.includes(paramFlag)) errors.push(paramFlag);
  }
  return {errors: errors, success: errors.length == 0}
}

updatePrompt()
printLine("<span class='intro'>WebShell [Version 1.5.00000.001]</span>");
printLine("<span class='intro'>(c) 2018 AlpacaFur. All rights reserved.</span>");
printNewLine();
if (commands) {

if (localStorage.getItem("name") == "true") {
  commands["name"].activate()
  printNewLine();
}
let options = queryParse();
if (!options.skipLoad){
queueLoading([
"Loading Stylesheets...      [=>                              ]0%",
"Loading Commands...         [=>                              ]0%",
"Booting Up...               [=>                              ]0%"]
,13)
.then(()=>{
  printNewLine();
  printHeader("BOOT COMPLETE");
  printNewLine();
  showPrompt();
})
}
else {
showPrompt();
}

}
