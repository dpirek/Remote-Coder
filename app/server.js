// References.
var http = require('http'),
    lightnode = require('lightnode'),
    querystring = require('querystring'),
    fs = require('fs'),
		c = require('../config');

// Create server.
var server = new http.Server();
server.listen(c.config.portNumber);

// Website static server.
var website = new lightnode.FileServer(c.config.staticContentPath);

// Request.
website.delegateRequest = function(req, resp) {
	return website;
};

// Message object.
var message = {
	send: function(){}
};

// On post request.
var onPost = function(d){
	console.log('got some data');
	message.send(d);
};

// When a request comes to the ip server.
server.addListener('request', function(req, resp) {

	if(req.method === 'POST' && req.url === '/json/code/update'){
			
		var requestParams = {},
				content = '';
		
		req.addListener('data', function(chunk) {
			content += chunk;
		});
		
		req.addListener('end', function() {
		
			// Request params.
			requestParams = querystring.parse(content);
			
			// On post callback.
			onPost(requestParams);
			
			// Response.
			resp.writeHead(200, {'content-type': 'text/html'});
			resp.write(JSON.stringify({
				isSucessful: true,
				message: 'fine',
				data: requestParams
			}));
			resp.end();
		});
	} else {
		website.receiveRequest(req, resp);
	}
});

// Sockets listerner.
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	
	// Static file loader over web sockets.
	socket.on('loadFile', function (url, callBack) {
		fs.readFile(c.config.appPath + '/web/' + url, function (err, content) {
			callBack(content.toString())
		});
  });
	
	// Service chanel.
	socket.on('service', function (url, callBack) {
		if(url === 'user/list'){
			callBack({user: 'none'})
		} else {
			callBack({foo: 'none'})
		}
  });
	
	// Send message.
	message.send = function(d){
		socket.emit('pushScript', d);
	};
});

console.log('running on port: ' + c.config.portNumber + '');