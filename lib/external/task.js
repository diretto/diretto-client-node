module.exports = (function() {

	var Client = function(direttoClient, serviceUri) {

		var uri = (function(base){
			return {
				allTasks : function(){
					return serviceUri+"/tasks"
				},
				fetchTasksMetadata : function(){
					return serviceUri+"/tasks/metadata"
				},
				fetchTasksSnapshots : function(){
					return serviceUri+"/tasks/snapshots"
				},
				index :  function(){
					return serviceUri;
				},
				
				
			};
		})(serviceUri);

		
		
		var listAllTasks = function(callback){
			direttoClient.getList(uri.allTasks(), callback);
		};
		
		var fetchMultiple = function(uri, list, callback){
			direttoClient.r.postJSON({
				uri: uri,
				json : list,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else{
					callback(null, body.results);
				}
			});
		};

		var fetchTasksMetadata = function(tasks, callback){
			fetchMultiple(uri.fetchTasksMetadata(), {
				tasks : tasks
			},callback);
		};
		
		var fetchTasksSnapshots = function(tasks, callback){
			fetchMultiple(uri.fetchTasksSnapshots(), {
				tasks : tasks
			},callback);
		};
		
		var getIndex = function(callback){
			console.dir(uri.index());
			direttoClient.r.getJSON({
				uri: uri.index(),
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else{
					callback(null, body);
				}
			});
		}
		
		
		return {
			listAllTasks : listAllTasks,
			fetchTasksSnapshots : fetchTasksSnapshots,
			fetchTasksMetadata : fetchTasksMetadata,
			getIndex : getIndex
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