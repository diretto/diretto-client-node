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
			
//			http.get({
//				
//			}, function(res) {
//				  console.log("Got response: " + res.statusCode);
//				}).on('error', function(e) {
//				  console.log("Got error: " + e.message);
//			});
			
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
//			callback(null, download);
//			
//			,function(err, response){
//				if(err){
//					callback(err);
//				}
//				else{
//					response.on('data', function(data){
//						console.log(data.length);
//					})
//					callback(null,response);
//				}
//			});
//			console.dir(download);
//			console.log("hi");
//			download.once('response', function(res){
//				res.pause();
//				if(res.statusCode === 200){
//					callback(null, download);
//					res.resume();					
//				}
//				else{
//					callback({"error" : {"resons" : res.statusCode}});
//				}
//			});
//			download.pause();
		};
		
		
		return {
			downloadAttachment : downloadAttachment
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