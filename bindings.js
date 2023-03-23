const {ipcRenderer, remote} = require('electron')
const events = require('./events')
const model = remote.getGlobal('model')

module.exports = (() => {
	const bindings = {
		init: () => {
			ipcRenderer.on(events.main.selectedModificationUpdated, () => {
				renderer.setLoadingOverlayVisible(false)
				renderer.updateSelectedModification()
			})

			ipcRenderer.on(events.main.modificationPublished, () => {
				renderer.setLoadingOverlayVisible(false)
				renderer.updateSelectedModification()
			})

			ipcRenderer.on(events.main.installedModificationsListUpdated, () => {
				renderer.setLoadingOverlayVisible(false)
				renderer.updateInstalledModificationsList()
			})

			ipcRenderer.on(events.main.workshopModificationsListUpdated, () => {
				renderer.setLoadingOverlayVisible(false)
				renderer.updateWorkshopModificationsList()
			})

			ipcRenderer.on(events.main.allModificationsListsUpdated, () => {
				renderer.setLoadingOverlayVisible(false)
				renderer.updateInstalledModificationsList()
				renderer.updateWorkshopModificationsList()
			})	
		},
		
		onChangeModificationEnabled: (modification, enabled) => {
			model.setModificationEnabled(modification, enabled)
		},
		
		onWorkshopIdChanged: (id) => {
			const selectedModification = model.getSelectedModification()
			if (selectedModification != null) {
				selectedModification.workshopId = id ? id : null
			}
			
			renderer.updatePublishModificationButton()
		},
		
		selectModificationForPublish: () => {
			renderer.setLoadingOverlayVisible(true)
			ipcRenderer.send(events.renderer.selectModificationDirectory)
		},

		publishSelectedModification: () => {
			renderer.setLoadingOverlayVisible(true)
			ipcRenderer.send(events.renderer.publishModification)
		},

		refreshInstalledModifications: () => {
			renderer.setLoadingOverlayVisible(true)
			ipcRenderer.send(events.renderer.refreshInstalledModificationsList)
		},

		refreshWorkshopModifications: () => {
			renderer.setLoadingOverlayVisible(true)
			ipcRenderer.send(events.renderer.refreshWorkshopModificationsList)
		},
	}
	
	return bindings
})()