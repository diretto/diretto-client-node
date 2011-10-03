var util = require('util');
var http = require('http');
var url = require('url');
var crypto = require('crypto');

var r = require('./util/custom-request.js');

module.exports = function(params) {

	var serviceUri = params.serviceUri;
	
	var userId, userUri, password;
	
	var uri = (function(base){
		return {
			allTasks : function(){
				return serviceUri+"/tasks/all"
			},
			user : function(userId){
				return "/user/"+userId
			},
			
		};
	})(serviceUri);

	console.dir(params);
	userId = crypto.createHash('md5').update(params.email).digest('hex');
	userUri = uri.user(userId);
	
	//TODO: REMOVE
	 var password = params.password; 
//	password = userId;
	
	var base64header = "Basic "+(new Buffer(userId+":"+password).toString('base64'));
	console.log(base64header);
	/**
	 * So far only basic auth, but a more complex authhentication schema can be inserted too:
	 * Full access to the request options before dispatching, and deferred dispatching possible
	 * which allows to wrap into a callback. 
	 *  
	 */
	var auth = function(options,executeRequest){
		options.headers["Authorization"] = base64header;
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

		r.get({
			uri : uri,
			auth : auth,
			followRedirect : false,
			headers : {
				"Accept" : "application/json"
			}
		}, function(err, response, entity) {
			if (err) {
				callback(err);
			}
			else if (response.statusCode === 303) {
				fetchPage(response.headers.location, callback);
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
						"reason" : "Unexpected response code " + response.statusCode
					}
				});
			}
		});
	};

	var getService = function(name) {
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
		auth : auth,

		getService : getService,

		getList : getList,
		
		userId : userId
	};
};
