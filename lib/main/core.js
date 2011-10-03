var http = require('http');

module.exports = (function() {

	var Client = function(direttoClient, serviceUri) {
		
		var uri = require('../util/core-uri-builder.js')(serviceUri);
		var uriParser = require('../util/core-uri-parser.js')(serviceUri);
		
		/*
		 * ------------------------------- GENERIC CALLS ------------------------------------
		 */
		
		var genericAuthedGet = function(uri, callback){
			direttoClient.r.getJSON({
				uri: uri,
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
		
		var genericUnauthedGet = function(uri, callback){
			direttoClient.r.getJSON({
				uri: uri,
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
		
		/*
		 * ------------------------------- VOTE CALLS ------------------------------------
		 */		
		
		var getResourceVotes = function(resourceUri, callback){
			direttoClient.r.getJSON({
				uri: resourceUri+"/votes",
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
		
		var getUserVoteResource = function(resourceUri, callback){
			direttoClient.r.getJSON({
				uri: resourceUri+"/vote/user/"+direttoClient.userId,
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
		
		var undoVoteResource = function(resourceUri, callback){
			direttoClient.r.del({
				uri: resourceUri+"/vote/user/"+direttoClient.userId,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 204){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null);
				}
			});
		};
		
		var voteResource = function(resourceUri, vote, callback){
			
			direttoClient.r.put({
				uri: resourceUri+"/vote/user/"+direttoClient.userId+"/"+vote,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 202){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null);
				}
			});
		};
		
	
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
			genericUnauthedGet(uri.serviceRegistry(), callback);
		};	
		
		/**
		 * Returns the list of registered services. 
		 */
		var getMediaTypes = function(callback){
			genericUnauthedGet(uri.mediatypes(), callback);
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
			genericAuthedGet(userUri, callback);
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
			genericAuthedGet(messageUri, callback);
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
					callback(null, body);
				}
			});
		};
		
		var getDocumentMetaData = function(documentUri, callback){
			genericAuthedGet(documentUri, callback);
		};
		
		var getDocumentSnapshot = function(documentUri, callback){
			genericAuthedGet(documentUri+"/snapshot", callback);
		};
		
		var getDocumentFull = function(documentUri, callback){
			genericAuthedGet(documentUri+"/full", callback);
		};
		
		var listUserDocuments = function(userUri,callback){
			direttoClient.getList(userUri+"/documents", callback);
		};
		
		var listDocuments = function(callback){
			direttoClient.getList(uri.documents(), callback);
		};

		var listDocumentsSince = function(since, callback){
			direttoClient.getList(uri.documents()+"/since/"+since, callback);
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
		
		var getTime = function(timeUri, callback){
			genericAuthedGet(timeUri, callback);
		};
		
		var getAllTimes = function(documentUri, callback){
			genericAuthedGet(documentUri+"/times", callback);
		};
		
		/*
		 * ------------------------------- LOCATION RESOURCE ---------------------------------------
		 */
		
		var suggestLocation = function(docId, location, callback){
			direttoClient.r.put({
				uri: docId+"/location/"+location.lat+","+location.lon+","+location.variance,
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
		
		var getLocation = function(locationUri, callback){
			genericAuthedGet(locationUri, callback);
		};
		
		var getAllLocations = function(documentUri, callback){
			genericAuthedGet(documentUri+"/locations", callback);
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
		
		var getComment = function(commentUri, callback){
			genericAuthedGet(commentUri, callback);
		};
		
		var listDocumentComments = function(documentUri,callback){
			direttoClient.getList(documentUri+"/comments", callback);
		};
		
		var listUserComments = function(userUri,callback){
			direttoClient.getList(userUri+"/comments", callback);
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
		
		var getAttachment = function(attachmentUri, callback){
			genericAuthedGet(attachmentUri, callback);
		};		
		
		var forwardToAttachmentFile = function(attachmentUri, callback){
			direttoClient.r.get({
				uri: attachmentUri,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && (response.statusCode !== 301)){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null, response.headers.location);
				}
			});
		};
		
		var getDocumentAttachments = function(documentUri, callback){
			genericAuthedGet(documentUri+"/attachments", callback);
		};		
		
		var confirmAttachmentUpload = function(attachmentUri, token, callback){
			direttoClient.r.del({
				uri: attachmentUri+"/lock?token="+token,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 204){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null);
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
		
		var getLink = function(linkUri, callback){
			genericAuthedGet(linkUri, callback);
		};
		
		var listLinksSince = function(since, callback){
			direttoClient.getList(uri.links+"/since/"+since, callback);
		};
		
		var listLinks = function(callback){
			direttoClient.getList(uri.links, callback);
		};
		
		var getDocumentLinks = function(documentUri, callback){
			genericAuthedGet(documentUri+"/links", callback);
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
		
		var getCollection = function(colUri, callback){
			genericAuthedGet(colUri, callback);
		};
		
		var deleteFromCollection = function(colUri, docUri, callback){
			
			var parsedUri = uriParser.extractDocumentId(docUri);
			
			if(parseUri === null || !parsedUri.documentId){
				callback("Invalid document URI");
				return;
			}
			
			direttoClient.r.del({
				uri: colUri+"/document/"+parseUri.documentId,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 204){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null);
				}
			});	
		};	
		
		var deleteCollection = function(colUri, callback){
			direttoClient.r.del({
				uri: colUri,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 204){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null);
				}
			});	
		};	
		
		
		var getUserCollections = function(userUri, callback){
			genericAuthedGet(userUri+"/collections", callback);
		};
		
		var listCollectionDocuments = function(colUri, callback){
			direttoClient.getList(colUri+"/documents", callback);
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
		
		var getOwnKeyValue = function(docUri, key, callback){
			genericAuthedGet( docUri+"/value/"+direttoClient.userId+"/"+key, callback);
		};
		
		var getKeyValue = function(valueUri, callback){
			genericAuthedGet(valueUri, callback);
		};
		
		var getAllKeyValues = function(documentUri, callback){
			genericAuthedGet(documentUri+"/values", callback);
		};
		
		var deleteKeyValue = function(docUri, key, callback){
			direttoClient.r.del({
				uri: docUri+"/value/"+direttoClient.userId+"/"+key,
				auth : direttoClient.auth
			}, function(err, response, body){
				if(err){
					callback(err);
				}
				else if(response && response.statusCode && response.statusCode !== 204){
					callback(body || {"error" : {"reason" : "unknown"}});
				}
				else{
					callback(null);
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
		
		var getTag = function(tagUri, callback){
			genericAuthedGet(tagUri, callback);
		};
		
		var getResourceTag = function(tagUri, callback){
			genericAuthedGet(tagUri, callback);
		};

		var getResourceTags = function(resourceUri, callback){
			genericAuthedGet(resourceUri+"/tags", callback);
		};
		
		var listDocumentsByTag = function(tagUri, callback){
			direttoClient.getList(tagUri+"/documents", callback);
		};
		
		var listLinksByTag = function(tagUri, callback){
			direttoClient.getList(tagUri+"/links", callback);
		};
		
		var listTags = function(callback){
			direttoClient.getList(uri.basetags(), callback);
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
			getDocumentMetaData : getDocumentMetaData,
			getDocumentSnapshot : getDocumentSnapshot,
			getDocumentFull : getDocumentFull,			
			listUserDocuments : listUserDocuments
			listDocuments : listDocuments,
			listDocumentsSince : listDocumentsSince,
			
			suggestTime : suggestTime,
			getTime : getTime,
			getAllTimes : getAllTimes,
			
			suggestLocation : suggestLocation,
			getLocation : getLocation,
			getAllLocations : getAllLocations,
			
			
			createComment : createComment,
			getComment : getComment,
			listUserComments : listUserComments,
			listDocumentComments : listDocumentComments,
			
			createAttachment : createAttachment,
			getAttachment : getAttachment,
			forwardToAttachmentFile : forwardToAttachmentFile,
			getDocumentAttachments  : getDocumentAttachments,
			confirmAttachmentUpload : confirmAttachmentUpload,
						
			
			createLink : createLink,
			getLink : getLink,
			listLinks : listLinks,
			listLinksSince : listLinksSince,
			getDocumentLinks : getDocumentLinks, 
			
			
			createCollection : createCollection,
			changeCollection : changeCollection,
			addToCollection : addToCollection,
			getCollection : getCollection,
			deleteFromCollection : deleteFromCollection,
			deleteCollection : deleteCollection,
			getUserCollections : getUserCollections,
			listCollectionDocuments : listCollectionDocuments,
			
			
			setKeyValue : setKeyValue,
			getOwnKeyValue : getOwnKeyValue,
			getKeyValue : getKeyValue,
			getAllKeyValues : getAllKeyValues,
			deleteKeyValue : deleteKeyValue,
			
			
			createTag : createTag, 
			appendTag  : appendTag,
			getResourceTag : getResourceTag,
			getResourceTags : getResourceTags,
			getTag : getTag,
			listDocumentsByTag : listDocumentsByTag,
			listLinksByTag : listLinksByTag
			
			
			getResourceVotes : getResourceVotes,
			getUserVoteResource : getUserVoteResource,
			undoVoteResource : undoVoteResource,
			voteResource : voteResource		
			
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
