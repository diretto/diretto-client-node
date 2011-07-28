var request = require('request');

module.exports = (function() {
	/**
	 * custom request that allows pluggable authentication
	 */
	var customRequest = function(options, callback) {
		if (!options.headers) {
			options.headers = {};
		}

		var r = function(options) {
			request(options, callback);
		}

		if (options.auth) {
			options.auth(options, r);
		}
		else {
			r(options);
		}
	};

	var customJSONrequest = function(options, callback) {
		if (!options.headers) {
			options.headers = {};
		}
		options.headers["Accept"] = "application/json";

		customRequest(options, function(err, response, body) {
			if (err) {
				callback(err);
			}
			else {
				if (response.headers && response.headers["content-type"] && response.headers["content-type"] === "application/json") {
					try {
						var j = JSON.parse(body);
						callback(null, response, j);
					}
					catch (e) {
						callback(e);
					}
				}
				else {
					callback({
						"error" : {
							"reason" : "Expected JSON content type"
						}
					})

				}
			}
		});
	};

	var get = function(options, callback) {
		if (!options) {
			options = {};
		}
		options['method'] = 'GET';
		customRequest(options, callback);
	};

	var post = function(options, callback) {
		if (!options) {
			options = {};
		}
		options['method'] = 'POST';
		customRequest(options, callback);
	};

	var put = function(options, callback) {
		if (!options) {
			options = {};
		}
		options['method'] = 'PUT';
		customRequest(options, callback);
	};

	var del = function(options, callback) {
		if (!options) {
			options = {};
		}
		options['method'] = 'DELETE';
		customRequest(options, callback);
	};

	var getJSON = function(options, callback) {
		if (!options) {
			options = {};
		}
		options['method'] = 'GET';
		customJSONrequest(options, callback);
	};

	var putJSON = function(options, callback) {
		if (!options) {
			options = {};
		}
		options['method'] = 'PUT';
		customJSONrequest(options, callback);
	};
	var delJSON = function(options, callback) {
		if (!options) {
			options = {};
		}
		options['method'] = 'DELETE';
		customJSONrequest(options, callback);
	};
	var postJSON = function(options, callback) {
		if (!options) {
			options = {};
		}
		options['method'] = 'POST';
		customJSONrequest(options, callback);
	};

	return {
		customRequest : customRequest,
		customJSONrequest : customJSONrequest,
		request : request,

		post : post,
		get : get,
		put : put,
		del : del,

		getJSON : getJSON,
		delJSON : delJSON,
		postJSON : postJSON,
		putJSON : putJSON,
	};
})();