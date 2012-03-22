(function(){
	
	var loadScript = function(sScriptSrc, callbackfunction) {
	
		// Gets document head element
		var oHead = document.getElementsByTagName('head')[0];
		if(oHead) {
		
			// Creates a new script tag		
			var oScript = document.createElement('script');
					
			// Adds src and type attribute to script tag
			oScript.setAttribute('src',sScriptSrc);
			oScript.setAttribute('type','text/javascript');
	
			// Calling a function after the js is loaded (IE).
			var loadFunction = function() {
				if (this.readyState == 'complete' || this.readyState == 'loaded') {
					callbackfunction(); 
				}
			};
			
			oScript.onreadystatechange = loadFunction;
	
			// Calling a function after the js is loaded (Firefox).
			oScript.onload = callbackfunction;
			
			// Append the script tag to document head element.
			oHead.appendChild(oScript);
		}
	};
	
	// Load socket script.
	loadScript('http://localhost:8083/socket.io/socket.io.js', function(){
	
		window.APP = {};

		APP.socket = io.connect('http://localhost:8083');
		
		var socket = APP.socket;
		
		var oHead = document.getElementsByTagName('head')[0];
		
		APP.exeScript = function(d){
			var oScript = document.createElement('script');
	    oScript.setAttribute('type', 'text/javascript');
	    oScript.innerHTML = d;
			oHead.appendChild(oScript);
		};
		
		// JS loader.
		var require = function(path, callBack){
		
			// Load js libs.
			socket.emit('loadFile', path, function (d) {
				APP.exeScript(d);
				callBack();
			});
		};
		
		// Load css.
		var loadCss = function(d){
			var oStyle = document.createElement('style');
	    oStyle.innerHTML = d;
			oHead.appendChild(oStyle);
		};
		
		// Get content div.
		var contentDiv = document.getElementById('content');
		
		// Content updater.
		var updateContent = function(d){
			contentDiv.innerHTML = d;
		};
		
		// Load jquery.
		//require('js/jquery.js', function(){
			
			// Listen for code messages.
			socket.on('pushScript', function(d){
			
				if(d.type === 'javascript') {
					APP.exeScript(d.code);
				} else if(d.type === 'css') {
					loadCss(d.code);
				} else if(d.type === 'html') { 
					updateContent(d.code);
				}
			});
			
			socket.on('message', function(d){
				contentDiv.append(d);
			});
			
			// Show first message.
			updateContent('all loaded fine');
			
		//});
		
		// Load default styles.
		//socket.emit('loadFile', 'css/main.css', function (d) {
			//loadCss(d);
		//});
	});
}());