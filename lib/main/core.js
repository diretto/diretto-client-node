var http = require('http');

module.exports = (function() {

	var Client = function(direttoClient, serviceUri) {
		
		var uri = require('../util/core-uri-builder.js')(serviceUri);
	
		/*
		 * ------------------------------- SERVICE RESOURCE ------------------------------------
		 */
				
		/**
		 * Returns the UUID as value.
		 */
		var getUuid = function(callback){
			direttoClient.r.getJSON({
				uri: uri.uuid()
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else{
					callback(null, body.uuid);
				}
			});
		};
		
		/**
		 * Returns the list of registered services. 
		 */
		var getServiceRegistry = function(callback){
			direttoClient.r.getJSON({
				uri: uri.serviceRegistry()
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else{
					callback(null, body);
				}
			});
		};
		
		/*
		 * ------------------------------- USER RESOURCE ---------------------------------------
		 */
				
		/**
		 * Creates a new user account.
		 */
		var createUser = function(email, password, username, callback){
			direttoClient.r.postJSON({
				uri: uri.users(),
				json : {
					email : email,
					password : password,
					username : username
				}
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 201){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, response.headers.location);
				}
			});
		};
		
		/**
		 * Changes values for the user currently active. 
		 */
		var changeUser = function(email, password, username, callback){
			direttoClient.r.putJSON({
				uri: uri.user(direttoClient.userId),
				json : {
					email : email,
					password : password,
					username : username
				},
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 202){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, response.headers.location);
				}
			});
		};	
	
		/**
		 * Takes a list of user URIs and returns details of the users.
		 */
		var getUsers = function(userUris, callback){
			direttoClient.r.postJSON({
				uri: uri.usersMultiple(),
				json : {
					users : userUris
				},
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 200){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, body);
				}
			});
		};
		
		/**
		 * Takes a a single user URI returns user details.
		 */
		var getUser = function(userUri, callback){
			direttoClient.r.getJSON({
				uri: userUri,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 200){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, body);
				}
			});
		};
		
		/**
		 * Returns a paginated list of all users.
		 * Uses the pagination method.
		 */
		var listAllUsers = function(callback){
			direttoClient.getList(uri.users(), callback);
		};
		
		/*
		 * ------------------------------- MESSAGE RESOURCE ------------------------------------
		 */
		
		/**
		 * Sends a new message to the given user.
		 */
		var sendMessage = function(title, content, receiverUserUri, callback){
			var targetUri = receiverUserUri+"/inbox/messages";
			direttoClient.r.postJSON({
				uri: targetUri,
				json : {
					title : title,
					content : content,
				},
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 201){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, body);
				}
			});
		};

		/**
		 * Returns the given message.
		 */
		var getMessage = function(messageUri, callback){
			direttoClient.r.getJSON({
				uri: messageUri,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 200){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, body);
				}
			});
		};

		/**
		 * Removes the given message from personal box.
		 */
		var deleteMessage = function(messageUri, callback){
			direttoClient.r.del({
				uri: messageUri,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 204){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, body);
				}
			});			
		};
		
		/**
		 * Returns a paginated list of inbox messages. 
		 */
		var listInbox = function(callback){
			direttoClient.getList(uri.inbox(direttoClient.userId), callback);
		};		
		
		/**
		 * Returns a paginated list of outbox messages. 
		 */
		var listOutbox = function(callback){
			direttoClient.getList(uri.outbox(direttoClient.userId), callback);
		};

		/**
		 * Returns a paginated list of inbox messages since the given date. 
		 */
		var listInboxSince = function(since, callback){
			direttoClient.getList(uri.inboxSince(direttoClient.userId, since), callback);
		};		
		
		/**
		 * Returns a paginated list of outbox messages since the given date. 
		 */
		var listOutboxSince = function(since,callback){
			direttoClient.getList(uri.outboxSince(direttoClient.userId, since), callback);
		};

				
		return {
			getUuid : getUuid,
			getServiceRegistry : getServiceRegistry,

			changeUser : changeUser,
			createUser : createUser,
			getUser : getUser,
			getUsers : getUsers,
			listAllUsers : listAllUsers,
			
			sendMessage : sendMessage,
			getMessage : getMessage,
			deleteMessage : deleteMessage,
			listInbox:listInbox,
			listOutbox:listOutbox,
			listInboxSince:listInboxSince,
			listOutboxSince:listOutboxSince,
			
			
		};
	};

	return {
		"api" : {
			"name" : "org.diretto.api.main.core",
			"version" : "v2"
		},
		"name" : "core",
		newClient : Client
	};
})();