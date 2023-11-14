'use strict';

const fs = require('fs')
const path = require('path')

let modification = (function()
{
	const manifestFileName = 'OwlcatModificationManifest.json'
	const workshopIdFileName = 'workshop_id.txt'
	
	function hasNotEmptyStringProperty(obj, propertyName) {
		return obj.hasOwnProperty(propertyName) &&
			obj[propertyName] != null &&
			typeof obj[propertyName] == 'string' &&
			obj[propertyName].length > 0			
	}
	
	return {
		load: function(folderPath) {
			if (!fs.existsSync(folderPath))
				throw Error("Can't find folder: " + folderPath)
			
			const manifestPath = path.join(folderPath, manifestFileName)
			if (!fs.existsSync(manifestPath))
				throw Error("Can't find manifest file: " + manifestFileName)
			
			let manifest = null
			try {
				manifest = JSON.parse(fs.readFileSync(manifestPath))
			} catch (error) {
				console.error(error)
				throw Error("Probably encountered malformed OwlcatModificationManifest.json!")
			}
			
			if (!hasNotEmptyStringProperty(manifest, "UniqueName"))
				throw Error("UniqueName is missing in manifest file " + manifestFileName)
			
			let workshopId = null
			const workshopIdPath = path.join(folderPath, workshopIdFileName)
			if (fs.existsSync(workshopIdPath)) {
				workshopId = fs.readFileSync(workshopIdPath).toString()
			}
			
			return {
				path: folderPath,
				id: manifest.UniqueName.replaceAll(' ', '-'),
				workshopId: workshopId,
				publishError: null,
				manifest: {
					UniqueName: manifest.UniqueName || "",
					Version: manifest.Version || "",
					DisplayName: manifest.DisplayName || "",
					Description: manifest.Description || "",
					Author: manifest.Author || "",
					Repository: manifest.Repository || "",
					ImageName: manifest.ImageName || "",
					HomePage: manifest.HomePage || "",
					Dependencies: [], // [{Name: string, Version: string}]
				},
			}
		}
	}
})()

module.exports = modification;
