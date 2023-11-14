const {remote} = require('electron')
const fs = require('fs')
const path = require('path')
const model = remote.getGlobal('model')

module.exports = (() => {
	const notSelectedModification = {
		path: 'none',
		manifest: {
			UniqueName: 'none',
			Version: 'none',
			DisplayName: 'none',
			Description: 'none',
		}
	}

	function itemFactory(itemName) {
		const html = fs.readFileSync(path.join(__dirname, 'view/items', itemName + '.html')).toString()
		return () => $.parseHTML(html)
	}

	const installedModificationItemFactory = itemFactory('installed-modification')
	const workshopModificationItemFactory = itemFactory('installed-modification')
	
	const renderer = {
		init: () => {
			renderer.updatePublishModificationButton()
			renderer.updateSelectedModification()
			renderer.setLoadingOverlayVisible(true)
			
			renderer.getWorkshopIdInput().change((event) => {
				bindings.onWorkshopIdChanged($(event.target).val())
			})
			
			renderer.getSelectModificationButton().click(() => {
				bindings.selectModificationForPublish()
			})

			renderer.getPublishModificationButton().click(() => {
				bindings.publishSelectedModification()
			})

			renderer.getRefreshInstalledModificationsButton().click(() => {
				bindings.refreshInstalledModifications()
			})

			renderer.getRefreshWorkshopModificationsButton().click(() => {
				bindings.refreshWorkshopModifications()
			})
		},

		setLoadingOverlayVisible: (visible) => {
			const spinner = $('#loading-overlay')
			if (visible) {
				spinner.show()
			} else {
				spinner.hide()
			}
		},
		
		getSelectModificationButton: () => {
			return $('#select-modification-directory')	
		},

		getPublishModificationButton: () => {
			return $('#publish-modification')
		},

		getWorkshopIdBlock: () => {
			return $('#modification-workshop-id')
		},
		
		getWorkshopIdInput: () => {
			return renderer.getWorkshopIdBlock().find('input')
		},
		
		getRefreshInstalledModificationsButton: () => {
			return $('#refresh-installed-modifications')	
		},

		getRefreshWorkshopModificationsButton: () => {
			return $('#refresh-workshop-modifications')
		},
		
		updatePublishModificationButton: () => {
			const modification = model.getSelectedModification()
			const visible = modification != null;
			const button = renderer.getPublishModificationButton()
			if (visible) {
				button.show()
				button.text(modification.workshopId == null ? 'Publish' : 'Update')
			} else {
				button.hide()
			}
		},
		
		updateSelectedModification: () => {
			const selectedModificationContainer = $('#selected-modification')
			const selectedModification = model.getSelectedModification() 
			
			const directoryPath = (selectedModification || notSelectedModification).path;
			const uniqueName = (selectedModification || notSelectedModification).manifest.UniqueName;
			const version = (selectedModification || notSelectedModification).manifest.Version;
			const displayName = (selectedModification || notSelectedModification).manifest.DisplayName;
			const description = (selectedModification || notSelectedModification).manifest.Description;
			const author = (selectedModification || notSelectedModification).manifest.Author;
			const imagename = (selectedModification || notSelectedModification).manifest.ImageName;
			
			$(selectedModificationContainer).find('.modification-directory').text(directoryPath)
			$(selectedModificationContainer).find('.modification-unique-name').text(uniqueName)
			$(selectedModificationContainer).find('.modification-version').text(version)
			$(selectedModificationContainer).find('.modification-display-name').text(displayName)
			$(selectedModificationContainer).find('.modification-description').text(description)
			$(selectedModificationContainer).find('.modification-author').text(author)
			$(selectedModificationContainer).find('.modification-image-name').text(imagename)
			
			if (selectedModification == null) {
				renderer.getWorkshopIdBlock().hide()
			} else {
				renderer.getWorkshopIdBlock().show()
				renderer.getWorkshopIdInput().val(selectedModification.workshopId || '')
			
				const publishErrorElement = $('#modification-publish-error');
				if (selectedModification.publishError) {
					publishErrorElement.show()
					publishErrorElement.text(selectedModification.publishError.toString())
				} else {
					publishErrorElement.hide()
					publishErrorElement.text('')
				}
			}

			renderer.updatePublishModificationButton()
		},
		
		updateInstalledModificationsList: () => {
			const modificationsList = $('#installed-modifications-list')
			$(modificationsList).empty()
			for (const modification of model.getInstalledModifications()) {
				const item = renderer.createInstalledModificationItem(modification)
				$(modificationsList).append(item)
			}
		},

		updateWorkshopModificationsList: () => {
			const modificationsList = $('#workshop-modifications-list')
			$(modificationsList).empty()
			for (const modification of model.workshopItems) {
				const item = renderer.createWorkshopModificationItem(modification)
				$(modificationsList).append(item)
			}
		},
		
		createInstalledModificationItem: (modification) => {
			const element = installedModificationItemFactory()

			let name = modification.manifest.DisplayName 
				? modification.manifest.DisplayName 
				: modification.manifest.UniqueName;
			if (modification.manifest.Version) {
				name += ` (${modification.manifest.Version})`
			}
			if (!name) {
				name = 'undefined modification name'
			}
			
			let description = (() => {
				const maxLength = 140
				let result = modification.manifest.Description
				if (!result) {
					return result
				}
				
				if (result.length <= maxLength) {
					return result
				}

				result = result.slice(0, maxLength) + '...'
			
				return result;
			})()
			
			$(element).find('.modification-name').text(name)
			$(element).find('.modification-description').text(description)
			
			$(element).find('.modification-enabled').prop('checked', model.isModificationEnabled(modification))
			$(element).find('.modification-enabled').change((event) => {
				bindings.onChangeModificationEnabled(modification, $(event.target).prop('checked'))
			})
			
			return element
		},

		createWorkshopModificationItem: (workshopItem) => {
			const element = workshopModificationItemFactory()

			let name = workshopItem.title;

			let description = (() => {
				const maxLength = 140
				let result = workshopItem.description
				if (!result) {
					return result
				}

				if (result.length <= maxLength) {
					return result
				}

				result = result.slice(0, maxLength) + '...'

				return result;
			})()

			$(element).find('.modification-name').text(name)
			$(element).find('.modification-description').text(description)

			$(element).find('.modification-enabled').hide()
			// $(element).find('.modification-enabled').prop('checked', false)
			// $(element).find('.modification-enabled').change((event) => {
			// 	bindings.onChangeModificationEnabled(modification, $(event.target).prop('checked'))
			// })

			return element
		}
	}
	
	return renderer
})()