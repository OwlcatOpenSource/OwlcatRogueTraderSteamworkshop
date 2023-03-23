const fs = require('fs') 
const path = require('path')

module.exports = {
	"makers": [
		{
			"name": "@electron-forge/maker-squirrel",
			"config": {
				"name": "owlcat_modifications_manager"
			}
		},
		{
			"name": "@electron-forge/maker-zip",
			"platforms": [
				"darwin"
			]
		},
		{
			"name": "@electron-forge/maker-deb",
			"config": {}
		},
		{
			"name": "@electron-forge/maker-rpm",
			"config": {}
		}
	],
	hooks: {
		postPackage: async (forgeConfig, options) => {
			const outputPath = options.outputPaths[0]
			fs.copyFileSync('./steam_appid.txt', path.join(outputPath, 'steam_appid.txt'))
		}
	}
}