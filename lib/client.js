var util = require('util');
var http = require('http');
var url = require('url');
var r = require('./util/custom-request.js');

module.exports = function(params) {

	var serviceUri = params.serviceUri;


	var auth = function(options,executeRequest){
		options.headers["Authorization"] = "Basic Zm9vOmZvbw==";
		executeRequest(options);		
	};	

	var getList = function(uri, callback) {

		var fetchPage, Cursor;

		/**
		 * Returns an object with 4 methods:
		 * 
		 * -hasNext => boolean -hasPrevious => boolean -fetchNext => callback
		 * function(err, list, cursor) -fetchPrevious => callback function(err,
		 * list, cursor)
		 * 
		 */
		Cursor = function(nextUri, previousUri) {

			var fetchNext, fetchPrevious;
			var noop = function() {
			};

			var hasNext = false;
			var hasPrevious = false;

			if (nextUri !== null) {
				hasNext = true;
				fetchNext = function(pageCallback) {
					fetchPage(nextUri, pageCallback);
				}

			}

			if (previousUri !== null) {
				hasPrevious = true;
				fetchPrevious = function(pageCallback) {
					fetchPage(nextUri, previousUri);
				}
			}

			return {
				hasNext : hasNext,
				hasPrevious : hasPrevious,
				fetchNext : fetchNext || noop,
				fetchPrevious : fetchPrevious || noop
			}
		};

		var handleResponsePage = function(error, response, entity, pageCallback) {
			var next = null;
			var previous = null;

			if (entity && entity.related && entity.related.length > 0) {
				entity.related.forEach(function(i) {
					if (i.link && i.link.rel && i.link.rel === 'next') {
						next = i.link.href;
					}
					else if (i.link && i.link.rel && i.link.rel === 'previous') {
						previous = i.link.href;
					}
				});
			}
			console.dir(typeof(entity));
			pageCallback(null, entity.list, Cursor(next, previous));
		};

		fetchPage = function(uri, pageCallback) {
			r.getJSON({
				uri : uri,
				auth : auth,
				headers : {
					"Accept" : "application/json"
				}
			}, function(err, response, body) {
				if (err) {
					pageCallback(err);
				}
				else if (response.statusCode === 200) {
					handleResponsePage(err, response, body, pageCallback);
				}
				else {
					callback({
						"error" : {
							"reason" : "fetch Unexpected response code " + response.statusCode
						}
					});
				}
			});
		};

		r.getJSON({
			uri : uri,
			auth : auth,
			headers : {
				"Accept" : "application/json"
			}
		}, function(err, response, entity) {
			if (err) {
				callback(err);
			}
			else if (response.statusCode === 303) {
				fetchPage(headers.location, callback);
			}
			else if (response.statusCode === 204) {
				callback(null, [], Cursor(null, null))
			}
			else if (response.statusCode === 200) {
				handleResponsePage(err, response, entity, callback);
			}
			else {
				callback({
					"error" : {
						"reason" : "red Unexpected response code " + response.statusCode
					}
				});
			}
		});
	};

	var getPlugin = function(name) {
		console.log(name);
		if (params.plugins[name]) {
			return params.plugins[name];
		}
		else {
			return null;
		}
	};

	return {
		r : r,

		getPlugin : getPlugin,

		getList : getList
	};
};
