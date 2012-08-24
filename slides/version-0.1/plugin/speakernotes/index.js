/*

  Modifications by rvidal
  
  Small workaround to keep the plugin working with 
  links between slide shows

*/
var express   = require('express');
var fs        = require('fs');
var io        = require('socket.io');
var _         = require('underscore');
var Mustache  = require('mustache');

var app       = express.createServer();
var staticDir = express.static;

io            = io.listen(app);

var opts = {
  port :      1947,
  baseDir :   __dirname + '/../../'
};

io.sockets.on('connection', function(socket) {
  socket.on('slidechanged', function(slideData) {
    socket.broadcast.emit('slidedata', slideData);
  });
});

app.use(express.logger());

app.configure(function() {
  [ 'assets', 'plugin' ].forEach(function(dir) {
    app.use('/' + dir, staticDir(opts.baseDir + dir));
  });
});

var slideShow;

app.get("/", function(req, res) {
  slideShow = slideShow || 'index.html'
  fs.createReadStream(opts.baseDir + slideShow).pipe(res);
});

app.get(/\/(.+\.html)/, function(req, res) {
  slideShow = req.params[0].toString();
  res.redirect('/');
});

app.get("/index", function(req, res) {
  slideShow = 'index.html';
  res.redirect('/');
});

app.get("/notes/:socketId", function(req, res) {

  fs.readFile(opts.baseDir + 'plugin/speakernotes/notes.html', function(err, data) {
    res.send(Mustache.to_html(data.toString(), {
      socketId : req.params.socketId
    }));
  });
  // fs.createReadStream(opts.baseDir + 'speakernotes/notes.html').pipe(res);
});

// Actually listen
app.listen(opts.port || null);

var brown = '\033[33m', 
  green = '\033[32m', 
  reset = '\033[0m';

var slidesLocation = "http://localhost" + ( opts.port ? ( ':' + opts.port ) : '' );

console.log( brown + "reveal.js - Speaker Notes" + reset );
console.log( "1. Open the slides at " + green + slidesLocation + reset );
console.log( "2. Click on the link your JS console to go to the notes page" );
console.log( "3. Advance through your slides and your notes will advance automatically" );
