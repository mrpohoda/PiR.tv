/**
 * Module dependencies.
 */

var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  path = require('path'),
  fs = require('fs'),
  io = require('socket.io').listen(server),
  spawn = require('child_process').spawn,
  omx = require('./public/js/omxcontrol.js'),
  Firebase = require("firebase");



// all environments
app.set('port', process.env.TEST_PORT || 8080);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public/dist')));
app.use(omx());

var firebaseRef = new Firebase("https://pirtv.firebaseio.com/");

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());

  var omx = {
    start: function (videoId, cb) {
      console.log('omx start');
      setTimeout(function () {
        console.log('omx finish');
        cb();
      }, 20000);
    },
    pause: function () {
      console.log('omx pause');
    },
    quit: function () {
      console.log('omx stop');
    }
  }
}

//Routes
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/remote', function(req, res) {
  // res.sendfile(__dirname + '/public/remote.html');
  res.sendfile(__dirname + '/public/dist/index.html');
});

app.get('/video/favourite', function(req, res) {
  firebaseRef.child('favourites').on('value', function (data) {
    var movies = data.val(),
      response = [];
    Object.keys(movies).forEach(function (id) {
      response.push(movies[id]);
    });
    res.json(response);
  })
});


//Socket.io Config
io.set('log level', 1);

server.listen(app.get('port'), function() {
  console.log('Pirate TV is running on port ' + app.get('port'));
});

var ss,
  nowPlaying,
  playlist = [];

//Run and pipe shell script output
function run_shell(cmd, args, cb, end) {
  var spawn = require('child_process').spawn,
    child = spawn(cmd, args),
    me = this;
  child.stdout.on('data', function(buffer) {
    cb(me, buffer);
  });
  child.stdout.on('end', end);
}

//Socket.io Server
io.sockets.on('connection', function(socket) {

  if (nowPlaying) {
    socket.emit("video", {
      action: 'play',
      video: nowPlaying
    });
  }

  function getFileName(video) {
    return 'video/' + video.id + '.mp4'; // 'video/%(id)s.%(ext)s'
  }

  function playVideo(video) {
    stopVideo();

    setTimeout(function () {
      nowPlaying = video;

      // socket.emit - send message only to current user
      // socket.broadcast.emit - send message to all except current user
      // io.sockets.emit - send message to all
      io.sockets.emit("video", {
        action: 'play',
        video: video
      });
      omx.start(getFileName(video), function () {
        broadcastStop();
        if (playlist.length) {
          playVideo(playlist.shift());
          broadcastPlaylist();
        }
      });
    }, 200);
  }

  function pauseVideo(video) {
    nowPlaying.isPaused = !nowPlaying.isPaused;
    io.sockets.emit("video", {
      action: 'pause',
      video: nowPlaying
    });
    omx.pause();
  }

  function stopVideo(video) {
    broadcastStop();
    omx.quit();
  }

  function broadcastStop() {
    nowPlaying = null;
    io.sockets.emit("video", {
      action: 'stop'
    });
  }

  function broadcastPlaylist() {
    io.sockets.emit("playlist", {
      data: playlist
    });
  }

  function download_file(video, cb) {
    var url = "http://www.youtube.com/watch?v=" + video.id,
      fileName = getFileName(video);
    var runShell = new run_shell('youtube-dl', ['-o', fileName, '-f', '/18/22', url],
      function(me, buffer) {
        me.stdout += buffer.toString();
        socket.emit("loading", {
          output: me.stdout
        });
        console.log(me.stdout);
      }, cb);
  }

  socket.on("video", function(data) {
    var action = data.action,
      video = data.video;

    if (action === "play") {
      fs.exists(getFileName(video), function(exists) {
        if (exists) {
          playVideo(video);
        } else {
          download_file(video, function () {
              //child = spawn('omxplayer',[id+'.mp4']);
              playVideo(video);
          });
        }
      });
    }
    else if (action === "pause") {
      pauseVideo(video);
    }
    else if (action === "stop") {
      stopVideo(video);
    }
    else if (action === 'favourite' && video) {
      var favouritesRef = firebaseRef.child("favourites");
      // this $$hashKey is added by Angular and will be resolved when switching from socket.io
      // to some Angular version of lib - it's because of JSON.stringify
      delete video.$$hashKey;
      favouritesRef.child(video.id).set(video);
    }
    else if (action === 'queue' && video) {
      fs.exists(getFileName(video), function(exists) {
        if (exists) {
          playlist.push(video);
        } else {
          download_file(video, function () {
              //child = spawn('omxplayer',[id+'.mp4']);
              playlist.push(video);
              broadcastPlaylist();
          });
        }
      });
    }
  });
});
