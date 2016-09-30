// Calling R in Node.js

// load modules
const http = require('http');
const fs = require('fs');
// install httpdispatcher: npm install https://github.com/alberto-bottarini/httpdispatcher.git
const HttpDispatcher = require('httpdispatcher'); 
const dispatcher = new HttpDispatcher();
// first way to call R: Using the rstats library
const rstats  = require('rstats');
const R = new rstats.session();
// second way to call R: Using child_process and a R script
const spawn = require('child_process').spawn;

// the port we want to listen to
const PORT=8080; 

// use the dispatcher
function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Dispatch
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}


// Home page
dispatcher.onGet("/", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h1>Home page</h1>');
    res.write('<a href="/page1">Go to page 1</a>');
    res.write('<br/>');
    res.write('<a href="/page2">Go to page 2</a>');
    res.end();
}); 


// Page1 : addition using rstats library
dispatcher.onGet("/page1", function(req, res) {
    fs.readFile('./resources/Raddition_page1.html', function (err, html){
		if (err) {
			throw err; 
		}   
        res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': html.length});
        res.write(html);
        res.end();
    });
});    
dispatcher.onPut("/put1", function(req, res) {
	var json = ''; 
	req.on('data', function(data) {
		json += data;
    });
    req.on('end', function() {
        var xy = JSON.parse(json);
        console.log(xy);
        R.assign('x', xy.x);
		R.assign('y', xy.y);
		var sum = R.parseEval("x+y");
		console.log(sum);
        res.end(JSON.stringify(sum));
    });
});


// Page2 : addition using Rscript and child_process
dispatcher.onGet("/page2", function(req, res) {
    fs.readFile('./resources/Raddition_page2.html', function (err, html){
		if (err) {
			throw err; 
		}   
        res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': html.length});
        res.write(html);
        res.end();
    });
});    

dispatcher.onPut("/put2", function(req, res) {
	var json = ''; 
	req.on('data', function(data) {
		json += data;
    });
    req.on('end', function() {
        var xy = JSON.parse(json);
		const addition = spawn('Rscript', ['./resources/Raddition_Rscript.R', xy.x, xy.y]);
		addition.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
			res.end(data);
		});
		addition.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});
		addition.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
		});        
    });
});


// Create a server and start
var server = http.createServer(handleRequest);
server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
