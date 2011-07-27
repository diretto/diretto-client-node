module.exports = (function() {

	var Client, service;

	service = {
		"api" : {
			"name" : "org.diretto.api.main.storage",
			"version" : "v2"
		},
		"name" : "storage",
		newClient : Client
	};

	var Client = function(direttoClient) {
		return {
			
		};
	};

	return service;
})();