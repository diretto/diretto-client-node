/**
 * diretto Main Client
 * 
 * 
 * 
 * @author Benjamin Erb
 */
(function() {

	var isBrowser;
	var direttoClientBuilder = {};
	var main = this; // global (node.js) || window (browser)
	
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = direttoClientBuilder;
		isBrowser = false;
	}
	else {
		main.direttoClientBuilder = direttoClientBuilder;
		isBrowser = true;
	}

	var getInstance = function(params, callback) {

		// this object will be emitted on successful client start
		var direttoClient;

		var user, password, serviceUri, restClient, plugins = {};

		// check params
		if (!params.user || typeof (params.user) !== 'string') {
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
		else if (!params.serviceUri || typeof (params.serviceUri) !== 'string') {
			callback({
				'error' : {
					'reason' : 'no service URI provided'
				}
			});
			return;
		}
		else if (!params.restClient || typeof (params.restClient) !== 'object' && params.restClient.get) {
			callback({
				'error' : {
					'reason' : 'no restClient instance provided'
				}
			});
			return;
		}
		else {
			user = params.user;
			password = params.password;
			serviceUri = params.serviceUri;
			restClient = params.restClient;

		}
		
		var authenticateRequest = function(headers){
			headers = headers || {};

			//TODO: add AUTH header
			headers['Authorization'] = 'Basic dXU6dXU=';
			
			return headers;
		};
		
		var authedGet = function(uri, headers, callback){
			headers = authenticateRequest(headers);
			restClient.get(uri, headers, callback);
		};
		var authedHead = function(uri, headers, callback){
			headers = authenticateRequest(headers);
			restClient.head(uri, headers, callback);
		};
		var authedPut = function(uri, headers, entity, callback){
			headers = authenticateRequest(headers);
			restClient.put(uri, headers, entity, callback);
		};
		var authedDel = function(uri, headers, entity, callback){
			headers = authenticateRequest(headers);
			restClient.del(uri, headers, entity, callback);
		};
		var authedPost = function(uri, headers, entity, callback){
			headers = authenticateRequest(headers);
			restClient.post(uri, headers, entity, callback);
		};

		direttoClient = {
				get : restClient.get,
				put : restClient.put,
				del : restClient.del,
				post : restClient.post,
				head : restClient.head,
				authedGet : authedGet,
				authedHead : authedHead,
				authedPut : authedPut,
				authedDel : authedDel,
				authedPost : authedPost
		};

		// check service URI and service index
		// TODO: validate baseUri
		// TODO: get index page, check version
		// TODO: load service registry, check for known services
		// TODO: load user page to check credentials

		// TODO: client specific calls

		// --------------- Plugin Handling ---------------

		direttoClient['registerPlugin'] = function(pluginObj, callback) {
			// TODO: validate pluginObj
			// TODO: check if targeted service is available
			var pluginServiceUri = "http://task.diretto.org/v2";

			if (!plugins[pluginObj.pluginName]) {
				pluginObj.getInstance(direttoClient, pluginServiceUri, function(err, pluginClient) {
					if (err) {
						callback(err);
					}
					else {
						plugins[pluginObj.pluginName] = pluginClient;
						callback(null, pluginClient);
					}
				});
			}
			else {
				callback({
					'error' : {
						'reason' : 'Plugin has already been registered'
					}
				});
			}
		};

		direttoClient['unregisterPlugin'] = function(pluginName) {
			if (plugins[pluginObj.pluginName]) {
				delete plugins[pluginObj.pluginName];
			}
		};

		direttoClient['getPlugin'] = function(pluginName) {
			if (plugins[pluginObj.pluginName]) {
				return plugins[pluginObj.pluginName];
			}
			else {
				return false;
			}
		};

		callback(null, direttoClient);
	};

	direttoClientBuilder.getInstance = getInstance;
})();
