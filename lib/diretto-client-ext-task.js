/**
 * diretto Main Client
 * 
 * 
 * 
 * @author Benjamin Erb
 */
(function() {

	var direttoTaskClientPlugin = {};

	var isBrowser;
	var main = this; // global (node.js) || window (browser)

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = direttoTaskClientPlugin;
		isBrowser = false;
	}
	else {
		main.direttoTaskClientPlugin = direttoTaskClientPlugin;
		isBrowser = true;
	}

	direttoTaskClientPlugin['api'] = {
		"name" : "org.diretto.api.external.task",
		"version" : "v2"
	};

	direttoTaskClientPlugin['pluginName'] = "task";

	var getInstance = function(direttoClient, taskServiceUri, callback) {

		var taskClient = {};

		var getAllTasks = function() {

			var fetchPage = function fetchPage(uri) {
				direttoClient.authedGet(uri, {}, function(err, status, headers, entity) {
					if (err) {
						console.log(err);
					}
					else {
						var tasks = [];
						entity.list.forEach(function(i) {
							console.log(i.task.link.href);
							tasks.push(i.task.link.href);
						});

						entity.related.forEach(function(i) {
							if (i.link.rel === "next") {
								fetchPage(i.link.href);
							}
						});

						if (tasks.length > 0) {
							direttoClient.authedPost("http://task.diretto.org/v2/tasks/snapshots", {
								"Content-Type" : "application/json"
							}, {
								tasks : tasks
							}, function(err, status, headers, entity) {
								if (!err && status === 200) {
									for ( var i in entity.results) {
										console.log(entity.results[i].task.title);
									}
								}
							});
						}

					}
				});
			};

			direttoClient.authedGet("http://task.diretto.org/v2/tasks/all", {}, function(err, status, headers, entity) {
				if (err) {
					console.log(err);
				}
				else if (status === 303) {
					fetchPage(headers.location);
				}
				else {
					console.log(status);
				}
			});
		};

		var foo = function() {
			direttoClient.get(taskServiceUri, {}, function(err, status, headers, entity) {
				if (err) {
					console.log(err);
				}
				else {
					console.log(entity);
				}
			});
		};
		taskClient['foo'] = foo;
		taskClient['getAllTasks'] = getAllTasks;

		callback(null, taskClient);
	};

	direttoTaskClientPlugin.getInstance = getInstance;

})();
