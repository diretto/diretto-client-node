(function() {

	var direttoClientBuilder = {};
	var main = this; // global (node.js) || window (browser)

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = direttoClientBuilder;
	}
	else {
		main.direttoClientBuilder = direttoClientBuilder;
	}
	
	
	
	var client = function(restClient, baseUri){
		
		//TODO: validate baseUri
		//TODO: get index page, check version
		//TODO: load service registry, check for known services
		
		//TODO: client specific calls
		
		
		return{
			
			get : restClient.get,
			put : restClient.put,
			del : restClient.del,
			post : restClient.post,
			head : restClient.head,
		
		};
	};
	
	direttoClientBuilder.getInstance = client; 
	
})()