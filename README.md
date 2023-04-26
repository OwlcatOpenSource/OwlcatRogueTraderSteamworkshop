# OwlcatRogueTraderSteamworkshop
This is a simple application built on [Electron](https://www.electronjs.org/) for using Steam Workshop for Warhammer 40000: Rogue Trader. It's minumalistic with main goal to give ability to upload your mods to Workshop.

## Requirements
1. [node.js](https://nodejs.org/en/download)
2. npm - ships as a part of node.js
3. [MINGW](https://www.mingw-w64.org/) / Command Prompt (Windows built-in) - optional. MINGW is also shipped as a part of [SourceTree](https://www.sourcetreeapp.com/), just in case you have it.

### Installing Node.js
In case you have no [Node.js](https://nodejs.org/en/download) on your computer you have to install it by downloading an installer from the official site. When the installation is done, you need to configure your OS environment. This means you'll need to set up 2 system variables: node and npm.
This can be done by following steps:
1. open Control Panel -> System and Security -> System -> Advanced System Settings -> Environment Variables
2. in "User variables" or "System variables" find variable PATH and add node.js folder path as value. Usually it is `C:\Program Files\nodejs;`. If variable doesn't exists, create it. Value in PATH variable is the list of paths separated by semicolon. For exapmle: `C:\Python39\Scripts\;C:\Python39\;C:\Windows\system32;C:\Windows;C:\Program Files (x86)\dotnet\;C:\Program Files\nodejs\;C:\Users\%USERNAME%\AppData\Roaming\npm`
3. Restart your IDE or computer.

Setting up system variables can be useful in case running `setup.bat` script and getting error like:
`'node' is not recognized as an internal or an external command`
For more information on this problem please visit [this StackOverflow question](https://stackoverflow.com/questions/23412938/node-is-not-recognized-as-an-internal-or-an-external-command-operable-program).

## Setup 
Two `.bat` files are located in the repo root folder. Double click to run them in this order:
1. *setup.bat* - will make a setup of js modules.
2. *start.bat* - will run the app itself. 

In case 2 `.bat` files fail, you can try to set up and launch manually with steps given below. 

### Setup with MINGW
1. Download this repo.
2. Start MINGW and navigate to the repo root folder.
3. Run `npm i`.
4. To launch the app run `./node_modules/electron/dist/electron.exe .`
5. Do not close MINGW until you're done with the app.

### Setup with Command Prompt
1. Donwload this repo.
2. Start Command Prompt and navigate to the repo root folder.
3. Run `npm i`.
4. To launch the app run `node_modules\electron\dist\electron.exe .`
