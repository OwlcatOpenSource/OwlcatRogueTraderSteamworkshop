'use strict';

const modification = require('./modification')
const path = require('path')
const fs = require('fs')
const fs_extra = require('fs-extra')
const {app, remote} = require('electron')
const extract = require("extract-zip");
const workshopIdFileName = 'workshop_id.txt'


module.exports = (() => {
	let model;

	function updateInstalledModifications() {
		model.installedModifications = []
		
		const modificationSourceFolders = (model.modificationSettings.SourceDirectories
			.concat(model.getDefaultModificationsFolderPath())).concat(model.getDefaultUmmModificationsFolderPath())
		
		for (const modificationsFolderPath of modificationSourceFolders) {
			try {
				const fileNames = fs.readdirSync(modificationsFolderPath)
				for (const fileName of fileNames) {
					try {
						const modificationPath = path.join(modificationsFolderPath, fileName)
						const stats = fs.lstatSync(modificationPath)
						if (!stats.isDirectory())
							continue

						let mod = modification.load(modificationPath)
						if(mod != null)
							model.installedModifications.push(mod)
					} catch (e) {
						console.log(e)
					}
				}
			} catch (e) {
				console.log(e)
			}
		}
	}
	
	async function syncWorkshopItems() {
		const items = model.subscribedWorkshopItems
		const toRemove = []
		for (const modification of model.installedModifications) {
			if (modification.workshopId != null && !items.some(i => i.id === modification.workshopId)) {
				toRemove.push(modification)
			}
		}

		for (const modification of toRemove) {
			try {
				const index = model.subscribedWorkshopItems.indexOf(modification)
				model.subscribedWorkshopItems.splice(index, 1)
				fs.rmdirSync(modification.path, {recursive:true})
			} catch (e) {
				console.log(e)
			}
		}

		//Check for subscribed workshop mods and install them in game
		for (const item of items) {
			if (!model.installedModifications.some(i => i.workshopId === item.id)) {
				//We expect to get ...legacy.bin archive with mod from workshop, if mod was created with mod template and
				// uploaded with this tool. But some UMM created mods are uploaded as an archive. So their template 
				// name could be "name".zip(rar).
				let itemPath = item.path
				console.log("item path " + item.path)
				if(!fs.lstatSync(itemPath).isFile())
				{
					console.log("...legacy.bin formatted file not found. Inspecting folder for custom archives...")
					let files = fs.readdirSync(itemPath)
					if(files.length > 1)
					{
						throw new Error("More than one file in mod directory " + itemPath)
					}
					let itemToInspect = files[0];
					if(itemToInspect.endsWith("zip") || itemToInspect.endsWith("rar") || itemToInspect.endsWith("bin")) {
						let itemToInspectFullPath = item.path + "\\" + itemToInspect
						//Fail finding archive mod files
						if(!fs.lstatSync(itemToInspectFullPath).isFile()) {
							console.log("File not found: " + itemToInspectFullPath)
							continue
						}
						//Fixing path to mod archive
						console.log("Found potential mod archive with mod: " + itemToInspect)
						console.log("Trying to install...")
						item.path = itemToInspectFullPath
						console.log("Full item path: " + item.path)
					}
					else
					{
						continue
					}
				}
				
				const targetFolderName = path.basename(item.path)
				const targetItemFolderPath = itemPath.replace(targetFolderName, '')
				const tempFolderPath = path.join(targetItemFolderPath, 'temp', targetFolderName)
				const tempFolderInfoFilePath = path.join(tempFolderPath, 'Info.json')
				let targetFolderPath = path.join(model.getDefaultModificationsFolderPath(), targetFolderName)
				
				 try {
					//Extract .bin mod file into ./temp folder
					await extract(item.path, {dir: tempFolderPath}).then(() => {
						//Check if Info.json file exists -> UMM mod. Otherwise Owlcat mod. Select install folder according to that.
						if (fs.existsSync(tempFolderInfoFilePath)) {
							targetFolderPath = path.join(model.getDefaultUmmModificationsFolderPath(), targetFolderName)
						} else {
							targetFolderPath = path.join(model.getDefaultModificationsFolderPath(), targetFolderName)
						}

						try {
							//Move unarchived folder to game mods install folder 
							if(fs.existsSync(targetFolderPath)){
								console.log("Mod target directory already exists : " + targetFolderPath + " . Consider removing the folder. Skipping install.")
							}
							else {
								fs_extra.moveSync(tempFolderPath, targetFolderPath)
							}
						}
						catch (e) {
							console.log("Exception while moving mod from temp folder to target path: " + e)
							console.log("tempPath : " + tempFolderPath)
							console.log("targetPath : " + targetFolderPath)
							throw new Error(e)
						}
						//Add workshop_id.txt file with steam workshop item id content to the mod folder
						const workshopIdFilePath = path.join(targetFolderPath, workshopIdFileName)
						try {
							fs.writeFileSync(workshopIdFilePath, item.id)
						}
						catch (e) {
							console.log("Exception while creating WorkshopId file : " + e)
							console.log("workshopIdFile path : " + workshopIdFilePath)
							throw new Error(e)
						}
						// Remove 'garbage' temp folder
						const tempFolder = path.join(targetItemFolderPath, 'temp')
						try {
							if (fs.existsSync(tempFolder)) {
								fs.rmdirSync(tempFolder, {recursive: true})
							}
						}
						catch (e) {
							console.log("Exception while removing temp folder: " + e)
							console.log("tempFolder : " + tempFolder)
							throw new Error(e)
						}
					})
				}
				catch (e) {
					console.log("Exception while extracting mod archive: " + e)
					throw new Error(e)
				}
			}
		}
	}
	
	model = {
		selectedModification: null,
		installedModifications: [], // [modification]
		subscribedWorkshopItems: [], // [{id, path}]
		workshopItems: [],
		modificationSettings: {
			SourceDirectories: [],
			EnabledModifications: [],
		},
		
		/*
		Path to .../appData/LocalLow/Owlcat Games/WH 40000 RT/.
		Also known as Application.PersistentDataPath in Unity3d
		 */
		getRogueTraderAppDataPath: (filename = "") => {
			return path.join(
				(app || remote.app).getPath('appData'), 
				"..", 
				"LocalLow/Owlcat Games/Warhammer 40000 Rogue Trader",
				filename);
		},
		
		/*
		Path to OwlcatModificationManagerSettings.json file in local AppData
		 */
		getModificationSettingsPath: () => {
			return model.getRogueTraderAppDataPath('OwlcatModificationManagerSettings.json')
		},

		/*
		Path to Modifications folder, where all OwlcatModificationManager mods are installed
		 */
		getDefaultModificationsFolderPath: () => {
			return model.getRogueTraderAppDataPath('Modifications')
		},

		/*
		Path to UnityModManager folder, where all UMM mods are installed
 		*/
		getDefaultUmmModificationsFolderPath: () => {
			return model.getRogueTraderAppDataPath('UnityModManager')
		},

		selectModification: (folderPath) => {
			let modification = modification.load(folderPath)
			if(modification != null)
				model.selectedModification = modification 
		},

		getSelectedModification: () => {
			return model.selectedModification
		},
		
		update: async (subscribedWorkshopItems = null) => {
			const settingsPath = model.getModificationSettingsPath()
			if (!fs.existsSync(settingsPath))
				throw Error("Settings file not found: " + settingsPath)

			const settings = JSON.parse(fs.readFileSync(settingsPath))
			model.modificationSettings.SourceDirectories = settings.SourceDirectories || []
			model.modificationSettings.EnabledModifications = settings.EnabledModifications || []

			model.subscribedWorkshopItems = subscribedWorkshopItems || model.subscribedWorkshopItems || []

			updateInstalledModifications()
			
			if (subscribedWorkshopItems != null) {
				await syncWorkshopItems().then(() => {
					updateInstalledModifications()
				})
			}
		},
		
		saveSettings: () => {
			const settingsPath = model.getModificationSettingsPath()
			if (!fs.existsSync(settingsPath))
				throw Error("Settings file not found: " + settingsPath)

			const settingsContent = JSON.stringify(model.modificationSettings)
			fs.writeFileSync(settingsPath, settingsContent)
		},
		
		getInstalledModifications: () => {
			return model.installedModifications	
		},
		
		isModificationEnabled: (mod) => {
			return model.modificationSettings.EnabledModifications.includes(mod.manifest.UniqueName)
		},

		setModificationEnabled: (mod, enabled) => {
			const enabledNow = model.isModificationEnabled(mod)
			const enabledModifications = model.modificationSettings.EnabledModifications
			if (enabled && !enabledNow) {
				enabledModifications.push(mod.manifest.UniqueName)
			} else if (!enabled && enabledNow) {
				const index = enabledModifications.indexOf(mod.manifest.UniqueName)
				if (index > -1) {
					enabledModifications.splice(index, 1)
				}
			}
			
			model.saveSettings()
		},
	}
	global.model = model
	return model
})()
