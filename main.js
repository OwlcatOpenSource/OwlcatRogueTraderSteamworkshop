'use strict';

const { app, dialog, ipcMain, BrowserWindow, Notification } = require('electron')
const greenworks = require('./greenworks/greenworks')
const model = require('./model')
const path = require('path')
const events = require('./events')
const steam = require("./steam")
const electronLog = require('electron-log')
const fs = require("fs");

console.log = electronLog.log;
electronLog.catchErrors()

global.model = model

let win
function createWindow() {
	win = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			enableRemoteModule: true,
			contextIsolation: false,
			nodeIntegration: true
		}
	})
	
	return win
}

app.whenReady().then(() => {
	onApplicationReady()

	app.on('activate', () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0)
			onApplicationReady()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

ipcMain.on(events.renderer.selectModificationDirectory, selectModification)
ipcMain.on(events.renderer.publishModification, publishModification)

ipcMain.on(events.renderer.refreshInstalledModificationsList, () => {
	refreshInstalledModifications()
		.finally(() => win.webContents.send(events.main.installedModificationsListUpdated))
})

ipcMain.on(events.renderer.refreshWorkshopModificationsList, () => {
	refreshWorkshopModifications()
		.finally(() => win.webContents.send(events.main.workshopModificationsListUpdated))
})

function onApplicationReady() {
	console.log('Application ready.')
	
	try {
		greenworks.init()
	} catch (e) {
		console.log(e)
	}
	
	createWindow()
	win.show()
	win.loadFile(path.join(__dirname, 'view/index.html'))
		.then(onUIReady)
		.catch((e) => console.log('index.html isn\'t loaded: ' + e))
}

function showNotification(title, body) {
	const notification = {
		title: title,
		body: body
	}
	
	new Notification(notification).show()
}

function onUIReady() {
	console.log('UI ready.')
	checkDefaultFolders()
	refreshAll()
}

function checkDefaultFolders() {
	if (!fs.existsSync(model.getDefaultModificationsFolderPath()))
	{
		console.log("Modifications folder doesn't exist. Creating new one.")
		fs.mkdirSync(model.getDefaultModificationsFolderPath())
	}

	if(!fs.existsSync(model.getDefaultUmmModificationsFolderPath()))
	{
		console.log("UMM Modifications folder doesn't exist. Creating new one.")
		fs.mkdirSync(model.getDefaultUmmModificationsFolderPath())
	}

	if(!fs.existsSync(model.getModificationSettingsPath()))
	{
		console.log("Modifications manifest file doesn't exist. Creating new one.")
		fs.copyFileSync('OwlcatModificationManagerSettings.json', model.getModificationSettingsPath())
	}
}

function refreshAll() {
	Promise.all([refreshInstalledModifications(), refreshWorkshopModifications()])
		.finally(() => win.webContents.send(events.main.allModificationsListsUpdated))
}

async function refreshInstalledModifications() {
	await steam.syncSubscribedWorkshopItems()
		.then(async items => {
			console.log("Subscribed workshop items: " + items.length)

			await model.update(items)
		})
		.catch(async error => {
			console.log("Failed to get subscribed workshop items: " + error)

			await model.update()
		}
	)
}

async function refreshWorkshopModifications() {
	await steam.loadWorkshopItems()
		.then(async items => {
			console.log("Workshop items: " + items.length)

			model.workshopItems = items
		})
		.catch(async error => {
			console.log("Failed to get workshop items: " + error)
		})
}

function selectModification() {
	let directoryPath = dialog.showOpenDialogSync({
		properties: ['openDirectory']
	})
	if (directoryPath && directoryPath[0]) {

		model.selectModification(directoryPath[0])
		console.log('Modification for publish:')
		console.log(model.getSelectedModification())
	}
		win.webContents.send(events.main.selectedModificationUpdated)
	
}

function publishModification() {
	const modification = model.getSelectedModification()
	function success(handle) {
		console.log("Publish success: " + handle)

		modification.publishError = null
		modification.workshopId = handle || modification.workshopId
		win.webContents.send(events.main.modificationPublished)
	}

	function fail(error) {
		console.log("Publish error: " + error)

		if (modification != null) {
			modification.publishError = error
		}

		win.webContents.send(events.main.modificationPublished)
	}

	function progress(p) {
		console.log("Publish progress: " + p)
	}

	steam.publish(modification, progress)
		.then(success)
		.catch(fail)
}
