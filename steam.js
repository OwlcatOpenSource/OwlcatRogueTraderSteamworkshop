const greenworks = require('./greenworks/greenworks')
const {app} = require("electron");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

module.exports = (() => {
	return {
		publish: (modification, progress) => new Promise((resolve, reject) => {
			if (modification == null) {
				reject(Error("Modification is null"))
				return
			}

			const tempPath = app.getPath('temp')
			const tempFilePath = path.join(tempPath, modification.id + '.zip')

			function success(handle) {
				try {
					if (fs.existsSync(tempFilePath)) {
						fs.unlinkSync(tempFilePath)
					}
				} catch (e) {
					console.log(e)
				}

				resolve(handle || modification.workshopId)
			}

			function fail(error) {
				try {
					if (fs.existsSync(tempFilePath)) {
						fs.unlinkSync(tempFilePath)
					}
				} catch (e) {
					console.log(e)
				}

				reject(error)
			}

			try {
				if (fs.existsSync(tempFilePath)) {
					fs.unlinkSync(tempFilePath)
				}

				const output = fs.createWriteStream(tempFilePath);
				const archive = archiver('zip');

				output.on('close', () => {
					console.log('Archived: total bytes ' + archive.pointer() + ', ' + tempFilePath);

					try {
						if (modification.workshopId == null) {
							greenworks.ugcPublish(
								tempFilePath,
								modification.manifest.DisplayName,
								modification.manifest.Description,
								"", success, fail, progress)
						} else {
							greenworks.updatePublishedWorkshopFile(
								{tags: []},
								modification.workshopId,
								tempFilePath,
								"",
								modification.manifest.DisplayName,
								modification.manifest.Description, success, fail, progress)
						}
					} catch (e) {
						fail(e)
					}
				});

				archive.on('error', (err) => {
					fail(err)
				});

				archive.pipe(output)
				archive.directory(modification.path, false)
				archive.finalize()
			} catch (e) {
				fail(e)
			}
		}),
		
		loadWorkshopItems: () => new Promise((resolve, reject) => {
			const items = []

			function _success(pageNum)
			{
				return (results) =>
				{
					for (const item of results) {
						items.push(item)
					}
					
					if (results.length > 0) {
						getItems(pageNum + 1)
					} else {
						resolve(items)
					}
				}
			}

			function _fail(error) {
				if (items.length > 0) {
					resolve(items)
				} else {
					reject(error)
				}
			}

			function getItems(pageNum) {
				greenworks.ugcGetItems(
					{app_id: greenworks.getAppId(), page_num: pageNum},
					greenworks.UGCMatchingType.Items,
					greenworks.UGCQueryType.RankedByVotesUp,
					_success(pageNum),
					_fail)
			}

			getItems(1)
		}),

		syncSubscribedWorkshopItems: () => new Promise((resolve, reject) => {
			const items = []
	
			function _success(pageNum)
			{
				return (results) =>
				{
					results.forEach(i => {
						const folderPath = greenworks.ugcGetItemInstallInfo(i.publishedFileId).folder
						items.push({
							id: i.publishedFileId,
							path: folderPath
						})
					})
	
					if (results.length > 0) {
						getItems(pageNum + 1)
					} else {
						resolve(items)
					}
				}
			}
	
			function _fail(error) {
				reject(error)
			}
	
			function getItems(pageNum) {
				greenworks.ugcGetUserItems(
					{app_id: greenworks.getAppId(), page_num: pageNum},
					greenworks.UGCMatchingType.Items,
					greenworks.UserUGCListSortOrder.SubscriptionDateDesc,
					greenworks.UserUGCList.Subscribed,
					_success(pageNum),
					_fail)
			}
	
			getItems(1)
		}),
		
		subscribeModification: (workshopId) => new Promise((resolve, reject) => {
			
		})
	}
})()