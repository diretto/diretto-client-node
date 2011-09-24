var util = require('util');
var http = require('http');
var url = require('url');
var request = require('request');

var Client = require('./client.js');

module.exports = (function() {

	// Currently hard coded list of available plugins
	var plugins = [ require("./external/task.js"),require("./main/storage.js"),require("./main/core.js")];

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

		var email, password, coreUri;

		// check params
		if (!params.email || typeof (params.email) !== 'string') {
			callback({
				'error' : {
					'reason' : 'no email address provided'
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
			email = params.email;
			password = params.password;
			coreUri = params.coreUri;
		}
		
		// enabled plugins for this instance
		var enabledPlugins = {};

		var direttoClient = Client({
			coreUri : coreUri,
			email : email,
			password : password,
			plugins : enabledPlugins
		});
		
		// TODO: check if URI is accessable and a core URI root
		var registryUri = coreUri+"/service/registry";
		
		// Callback executed when the registry is loaded
		var enablePlugins = function(registryResponseBody){
			var obj = null;
			try{
				obj = JSON.parse(registryResponseBody);
			  }
			catch (e) {
				console.log(e);
				callback({
					'error' : {
						'reason' : 'Invalid URI of Core API service'
					}
				});
			}
			if(obj === null){
				callback({
					'error' : {
						'reason' : 'Invalid URI of Core API service'
					}
				});
				return;
			}
				
				var registryList = obj.services.list;
				 
				 // enable Core API anyway
				 enabledPlugins['core'] = loadedPlugins['core'].plugin.newClient(direttoClient,coreUri);

				if (params.plugins && params.plugins.length > 0) {
					for(var i = 0;i<params.plugins.length ;i++){
						if(params.plugins[i] !== "core"){
							var pluginName = params.plugins[i];
							
							// if there is a loaded plugin having this name, and
							// a service in the
							// registry matching the service identifier, enable
							// the plugin.
							
							if(loadedPlugins[pluginName]){
								var found = false;
								for(var j = 0;j< registryList.length && !found;j++){
									if(registryList[j].api.name === loadedPlugins[pluginName].api.name &&
											registryList[j].api.version === loadedPlugins[pluginName].api.version){
										 enabledPlugins[pluginName] = loadedPlugins[pluginName].plugin.newClient(direttoClient,registryList[j].link.href);
									}
								}
							}
						}
					}
				}
				callback(null, direttoClient);

		}
		
		request({
			uri: registryUri,
		}, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				  enablePlugins(body);
			  }
			  else if (!error && response.statusCode == 303) {
				  // TODO: catch 303 target
			  }
			  else{
					callback({
						'error' : {
							'reason' : 'Invalid URI of Core API service',
							'details' : error || null
						}
					});
			  }
		});  
// console.dir(registryUri);
		
		// TODO: if okay, load registry and register compatible plugins
		
// if (params.plugins && params.plugins.length > 0) {
// console.dir(params.plugins);
// console.dir(loadedPlugins['task'].plugin);
// lPlugins['task'] =
// loadedPlugins['task'].plugin.newClient(direttoClient,"http://task.diretto.org/v2");
// lPlugins['storage'] =
// loadedPlugins['storage'].plugin.newClient(direttoClient,"http://localhost:8000/");
// lPlugins['core'] =
// loadedPlugins['core'].plugin.newClient(direttoClient,"http://localhost:8001/v2");
// }

		
		// validate URI
		// load listed service


	};

	// provide a map only containing the name => api value pairs without
	// constructors.
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