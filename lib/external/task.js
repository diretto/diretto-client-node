module.exports = (function() {

	var Client = function(direttoClient, serviceUri) {

		var uri = (function(base){
			return {
				allTasks : function(){
					return serviceUri+"/tasks/all"
				}
			};
		})(serviceUri);

		
		
		var getAllTasks = function(callback){
			direttoClient.getList(uri.allTasks(), callback);
		};

		
		
		return {
			getAllTasks : getAllTasks
		};
	};

	return {
		"api" : {
			"name" : "org.diretto.api.external.task",
			"version" : "v2"
		},
		"name" : "task",
		newClient : Client
	};
})();