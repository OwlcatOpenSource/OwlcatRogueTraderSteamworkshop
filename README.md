# OwlcatRogueTraderSteamworkshop
This is a simple application built on [Electron](https://www.electronjs.org/) for using Steam Workshop for Warhammer 40000: Rogue Trader. It's minumalistic with main goal to give ability to upload your mods to Workshop.

## Requirements
1. [node.js](https://nodejs.org/en/download)
2. npm - ships as a part of node.js
3. [MINGW](https://www.mingw-w64.org/) / Command Prompt (Windows built-in) - optional. MINGW is also shipped as a part of [SourceTree](https://www.sourcetreeapp.com/), just in case you have it.
4. [Steam pc client](https://store.steampowered.com/about/).

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

## Inmportant notice
To make OwlcatRogueTraderSteamworkshop tool run and work you need to have Steam client on your PC. Steam should be launched and you should be logged in. If you try to use this tool without Steam running all the functionality will fail with random Steam API errors.

## Tool flow
What can be done using this tool:
1. Install existing mod from Steam Workshop to the game.
2. Uninstall existing mod from Steam Workshop from the game.
3. Publish your own mod to Steam Workshop.
4. Enable/disable mods used in game.

### Installing mod from Steam Workshop.
1. Launch Steam client and find Warhammer 40000: Rogue Trader (WHRT) in your game library.
2. Open WHRT workshop page inside Steam client.
3. Locate the mod you need in workhsop.
4. Open mod page by clicking mod item in Workshop.
5. Hit "Subscribe" button. This will donwload mod to Steam Workshop cache on your computer.
6. Launch OwlcatRogueTraderSteamworkshop tool if not launched already. If it's launched just click "Refresh" button near to "Installed" setion.
7. The mod you've just Subscribed should appear in "Installed" list 
8. Make sure the tick nead mod name is enabled to enable the mod in game.

At the moment of installing OwlcatRogueTraderSteamworkshop tool copies downloaded mod from Steam Workshop cache to directory inside game data folder. There are 2 folders in game data folder: Modifications (for mod built using OwlcatModificationTemplate) and UnityModManager (for mod build with UMM). This tool checks contents of the mod you're trying to upload and searched for file called Info.json - if this file exist in the rool of the mod contents, the mod is considered as UMM mod, otherwise OwlcatModificationTemplate mod.

### Uninstalling mod from Steam Workshop.
1. Launch Steam client and find Warhammer 40000: Rogue Trader (WHRT) in your game library.
2. Open WHRT workshop page inside Steam client.
3. Locate the mod you need in workhsop.
4. Open mod page by clicking mod item in Workshop.
5. Hit "Unsubscribe" button. 
6. Launch OwlcatRogueTraderSteamworkshop tool if not launched already. If it's launched just click "Refresh" button near to "Installed" setion.
7. The mod you've just Unsbscribed should disappear from "Installed" list 

### Publish your own mod to Steam Workshop.

#### Important notice for UnityModManager mods.
If you're going to publich UMM-based mod you have to add a couple of files to it. 
Create a file called `OwlcatModificationManifest.json` and place it near Info.json file of your mod (root folder). `OwlcatModificationManifest.json` contents should look like this (don't forget to write your own values, most of them can be taken from your `Info.json` file): 
```
{
    "UniqueName": "HelloWorldModification",
    "Version": "1.0",
    "DisplayName": "Hello Mods",
    "Description": "Simipliest test modification, printing \"Hello World\"",
    "Author": "OwlCat",
	"ImageName": "MyImage.jpg",
	"WorkshopId": "",
	"Repository": "",
	"HomePage": "",
	"Dependencies": []
}
```

Create a file called `OwlcatModificationSettings.json` and place it near Info.json file of your mod (root folder). `OwlcatModificationSettings.json` contents should look exactly tike this with no changes:
```
{
    "BundlesLayout": {
        "m_Guids": [],
        "m_Bundles": []
    },
    "BundleDependencies": {
        "m_List": []
    },
    "BlueprintPatches": []
}
```

To include a Thumbnail place the image into the root directory next to OwlcatModificationManifest.json and provide the name of the file as value for the ImageName key in the Manifest.

### Publishing your mod to Steam Workshop.
1. Launch OwlcatRogueTraderSteamworkshop tool. Open "Publish" tab at the top left of the UI.
2. In the Publish window click "Select" button.
3. In appeared dialog window select a folder of your mod.
4. Aftere selecting the directory fields in Publish window will be filled with the mod info.
5. If everything is correct, leave "Workshop ID" field empty.
6. Click "Publish" button and with until progress bar disappears.
7. If the upload was successfull a value in "Workshop ID" field will appear. Thats id of your mod in Steam Workshop. Note that it takes some time to make your mod appear in Steam Workshop after publishing. In most cases it takes about 5-10 minutes and that's Steam's feature and we can do nothing with it. At this moment publishing is done.
8. If an error occured while uploading it will be shown in tool written in red color. That's most likely Steam API error. Steam API errors are very general and describe nothing about what has happened. 
9. If you are given something like "Steam Cloud upload error" try to wait an hour and try to upload your mod again. Somethimes it works. If that doesn't help feel free to ask for help.

### Updating your published mod.
1. If it doesn't already exist, add the WorkshopId field to your OwlcatModificationManifest.json.
2. As value, add the Workshop Item ID of your mod (as a string).
3. Follow the publishing steps. The tool should automatically recognize the existing mod and update it instead of publishing a new one.

### Enable/disable mods used in game.
Enabled mod means that it is installed and will work in game. Disabled mod is istalled but won't be launched in game. Launch OwlcatRogueTraderSteamworkshop tool. Under "Installed" mod installed mods will be listed with checkbox near each mod. Checkbox with tick means enabled mod, without a tick - disabled. Just click in the checkbox to enable or disable a mod.
