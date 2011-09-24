var http = require('http');

module.exports = (function() {

	var Client = function(direttoClient, serviceUri) {
		
		var uri = (function(base){
			return {
				attachment: function(documentId, attachmentId, extension){
					return serviceUri+"/"+documentId+"/"+attachmentId+exentsion;
				}
			};
		})(serviceUri);
		
		var downloadAttachment = function(uri, callback){
			var download = direttoClient.r.request({
				uri : uri,
				onResponse : function(err, response){
					if(err){
						callback(err);
					}
					else if(response.statusCode === 200){
						callback(null, response);
					}
					else{
						callback({"error" : {"resons" : response.statusCode}});
					}					
				}
			});
		};
		
		var getAttachmentMetadata = function(uri, callback){
			direttoClient.r.request.head({
				uri: uri
			}, function(err, response){
				if(err){
					callback(err);
				}
				else{
					callback(null, response.headers);
				}
			});
		};
		
		
		return {
			downloadAttachment : downloadAttachment,
			getAttachmentMetadata : getAttachmentMetadata
		};
	};

	return {
		"api" : {
			"name" : "org.diretto.api.main.storage",
			"version" : "v2"
		},
		"name" : "storage",
		newClient : Client
	};
})();