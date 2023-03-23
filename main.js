const { app, BrowserWindow, Notification } = require('electron')
const greenworks = require('./greenworks/greenworks')
const fs = require('fs');

const window = (function() {
	let _instance;
	
	function createInstance() {
		return new BrowserWindow({
			width: 800,
			height: 600,
			thickFrame: true,
			webPreferences: {
				nodeIntegration: true
			}
		})
	}
	
	return {
		getInstance: function() {
			return _instance ?? (_instance = createInstance())
		}
	}
})()

app.whenReady().then(onApplicationReady)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		onApplicationReady()
	}
})

function showNotification(title, body) {
	const notification = {
		title: title,
		body: body
	}
	
	new Notification(notification).show()
}

function onApplicationReady() {
	window.getInstance().loadFile('index.html').then(onUIReady)
}

function onUIReady() {
	try {
		greenworks.init()
		showNotification("Steam", "Steam is launched (appid " + greenworks.getAppId() + ")")
		// uploadModification()
		// getModificationInfo()
	}
	catch (e) {
		console.log(e)
		showNotification("Steam", "Steam isn't launched")
	}
}

function uploadModification() {
	function success(handle) {
		console.log("success: " + handle)
	}
	
	function fail(error) {
		console.log("error: " + error)
	}
	
	function progress(p) {
		console.log("progress: " + p)
	}
	
	const path = "C:\\Users\\owladmin\\AppData\\LocalLow\\Owlcat Games\\Pathfinder Wrath Of The Righteous\\Modifications\\TestModification.zip"
	greenworks.ugcPublish(path, "TestWorkshopItem", "TestWorkshopItem", "",  success, fail, progress)
}

function getModificationInfo() {
	function success(results) {
		console.log("subscribed items:")
		results.forEach(i => {
			const folder = greenworks.ugcGetItemInstallInfo(i.publishedFileId).folder
			console.log("\t" + folder)
		})
	}

	function fail(error) {
		console.log("failed to get subscribed items: " + error)
	}

	greenworks.ugcGetUserItems(
		{app_id: greenworks.getAppId(), page_num: 1}, 
		greenworks.UGCMatchingType.Items,
		greenworks.UserUGCListSortOrder.SubscriptionDateDesc,
		greenworks.UserUGCList.Subscribed,
		success,
		fail)
}
