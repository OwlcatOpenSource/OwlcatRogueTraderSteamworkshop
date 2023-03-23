window.addEventListener('DOMContentLoaded', () => {
	const electronLog = require('electron-log')

	window.log = console.log = electronLog.log;
	electronLog.catchErrors()
	
	window.$ = window.jQuery = require('jquery')
	require('tether')
	require('bootstrap')

	window.renderer = require('./renderer')
	window.renderer.init()
	
	window.bindings = require('./bindings')
	window.bindings.init()
})