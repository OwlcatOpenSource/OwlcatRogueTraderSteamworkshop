# OwlcatRogueTraderSteamworkshop
This is a simple application built on [Electron](https://www.electronjs.org/) for using Steam Workshop for Warhammer 40000: Rogue Trader. It's minumalistic with main goal to give ability to upload your mods to Workshop.

## Requirements
1. [node.js](https://nodejs.org/en/download)
2. npm - ships as a part of node.js
3. [MINGW](https://www.mingw-w64.org/) / Command Prompt (Windows built-in) - optional. MINGW is also shipped as a part of [SourceTree](https://www.sourcetreeapp.com/), just in case you have it.

## Setup 
Two `.bat` files are located in the repo root folder. Double click to run them in this order:
1. setup.bat - will make a setup of js modules.
2. start.bat - will run the app itself. 

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
