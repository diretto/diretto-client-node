var util = require('util');
var http = require('http');
var url = require('url');
var request = require('request');

var Client = require('./client.js');

module.exports = (function() {

	//Currently hard coded list of available plugins
	//, require("./main/storage.js") 
	var plugins = [ require("./external/task.js")];

	var loadedPlugins = {};

	plugins.forEach(function(pluginObj) {
		if (!loadedPlugins[pluginObj.name]) {
			loadedPlugins[pluginObj.name] = {};
			loadedPlugins[pluginObj.name]["name"] = pluginObj.name;
			loadedPlugins[pluginObj.name]["plugin"] = pluginObj;
			loadedPlugins[pluginObj.name]["api"] = pluginObj.api;
		}
	});

	/**
	 * Creates a new client instance, if params and URI are valid
	 */
	var getInstance = function(params, callback) {

		var user, password, coreUri;

		// check params
		if (!params.username || typeof (params.username) !== 'string') {
			callback({
				'error' : {
					'reason' : 'no user name provided'
				}
			});
			return;
		}
		else if (!params.password || typeof (params.password) !== 'string') {
			callback({
				'error' : {
					'reason' : 'no password provided'
				}
			});
			return;
		}
		else if (!params.coreUri || typeof (params.coreUri) !== 'string') {
			callback({
				'error' : {
					'reason' : 'no service URI provided'
				}
			});
			return;
		}
		else {
			username = params.username;
			password = params.password;
			coreUri = params.coreUri;
		}
		
		var lPlugins = {};

		var direttoClient = Client({
			coreUri : coreUri,
			username : username,
			password : password,
			plugins : lPlugins
		});
		
		//TODO
//		if (params.plugins && params.plugins.length > 0) {
		console.dir(loadedPlugins['task'].plugin);
			lPlugins['task'] = loadedPlugins['task'].plugin.newClient(direttoClient,"http://task.diretto.org/v2");
			console.dir(loadedPlugins['task'].plugin.newClient(direttoClient,"http://task.diretto.org/v2"));
//		}

		
		//validate URI
		//load listed service

		callback(null, direttoClient);
	};

	//provide a map only containing the name => api value pairs without constructors.
	var pluginList = {};
	Object.keys(loadedPlugins).forEach(function(key) {
		pluginList[key] = loadedPlugins[key].api;
	});

	var listPlugins = function() {
		return pluginList;
	};

	return {

		getInstance : getInstance,
		listPlugins : listPlugins
	}

})();