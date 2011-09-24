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
		
		/**
		 * Returns the list of registered services. 
		 */
		var getMediaTypes = function(callback){
			direttoClient.r.getJSON({
				uri: uri.mediatypes()
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
		
		
		/*
		 * ------------------------------- DOCUMENT RESOURCE -----------------------------------
		 */
		
		var createDocument = function(docId, docData, callback){
			direttoClient.r.putJSON({
				uri: uri.document(docId),
				json : docData,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && (response.statusCode !== 201 || response.statusCode !== 202)){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, response.headers.location);
				}
			});
		};
		
		/*
		 * ------------------------------- TIME RESOURCE ---------------------------------------
		 */
		
		var suggestTime = function(docId, times, callback){
			direttoClient.r.put({
				uri: docId+"/time/"+times.after+"--"+times.before,
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
		
		/*
		 * ------------------------------- COMMENT RESOURCE ------------------------------------
		 */
		
		var createComment = function(docUri, content, callback){
			var targetUri = docUri+"/comments";
			direttoClient.r.postJSON({
				uri: targetUri,
				json : {
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
		
		/*
		 * ------------------------------- ATTACHMENT RESOURCE ---------------------------------
		 */
		
		var createAttachment = function(docUri, attachmentData, callback){
			var targetUri = docUri+"/attachments";
			direttoClient.r.postJSON({
				uri: targetUri,
				json : attachmentData,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && (response.statusCode !== 201 || response.statusCode !== 202)){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, body);
				}
			});
		};
		
		/*
		 * ------------------------------- LINK RESOURCE ---------------------------------------
		 */
		
		var createLink = function(linkData, callback){
			direttoClient.r.postJSON({
				uri: uri.links(),
				json : linkData,
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
		
		/*
		 * ------------------------------- COLLECTION RESOURCE ---------------------------------
		 */
		
		var createCollection = function(colData, callback){
			direttoClient.r.postJSON({
				uri: uri.userCollections(direttoClient.userId),
				json : colData,
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
		
		
		var changeCollection = function(colUri, colData, callback){
			direttoClient.r.putJSON({
				uri: colUri,
				json : colData,
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
		
		var addToCollection = function(colUri, docUri, callback){
			direttoClient.r.postJSON({
				uri: colUri + "/documents",
				json : {
					document : {
						link : {
							rel : "self",
							href : docUri
						}
					}
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
					callback(null, body);
				}
			});
		};
		
		/*
		 * ------------------------------- KEY/VALUES RESOURCE ---------------------------------
		 */
		
		var setKeyValue = function(docUri, key, value, callback){
			direttoClient.r.putJSON({
				uri: docUri+"/value/"+direttoClient.userId+"/"+key,
				json : {
					value : value
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
					callback(null, body);
				}
			});
		};
		
		/*
		 * ------------------------------- TAG RESOURCE ----------------------------------------
		 */
		
		var createTag = function(tagName, callback){
			direttoClient.r.postJSON({
				uri: uri.basetags(),
				json : {
					value : tagName
				},
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && (response.statusCode !== 201 || response.statusCode !== 202)){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, body);
				}
			});
		};
		
		var appendTag = function(resourceUri, tagUri, callback){
			direttoClient.r.postJSON({
				uri: resourceUri+"/tags",
				json : {
					baseTag : {
						link : {
							rel : "self",
							href : tagUri
						}
					}
				},
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && (response.statusCode !== 201 || response.statusCode !== 202)){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, body);
				}
			});
		};
		
		return {
			getUuid : getUuid,
			getServiceRegistry : getServiceRegistry,
			getMediaTypes : getMediaTypes, 

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
			
			createDocument : createDocument,
			
			suggestTime : suggestTime,
			
			createComment : createComment,
			
			createAttachment : createAttachment,
			
			createLink : createLink,
			
			createCollection : createCollection,
			changeCollection : changeCollection,
			addToCollection : addToCollection,
			
			setKeyValue : setKeyValue,
			
			createTag : createTag, 
			appendTag  : appendTag
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