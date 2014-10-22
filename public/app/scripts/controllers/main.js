'use strict';

angular.module('myApp')
  .controller('MainCtrl', function ($scope, $http, youtube, mySocket) {
    $scope.foundItems = [];
    $scope.searchValue = '';
    $scope.nowPlaying;
    var host = 'http://127.0.0.1:8080';

    $scope.search = function (query) {
      var params = {
        query: query,
        limit: 12
      };
      youtube.getMovies(params).then(function (movies) {
        $scope.foundItems = movies.data;
        $scope.searchValue = '';
      });
    };

    $scope.play = function (movie) {
      movie.isPlaying = true;
      $scope.nowPlaying = movie;
      mySocket.emit('video', {
        action: 'play',
        video_id: movie.id
      });
    };

    $scope.pause = function (movie) {
      movie.isPlaying = false;
      $.get(host + '/omx/pause', function (data) {
        console.log(data);
      });
    };

    $scope.stop = function (movie) {
      movie.isPlaying = false;
      $scope.nowPlaying = null;
      $.get(host + '/omx/quit', function (data) {
        console.log(data);
      });
    };

    // Socket listeners
    // ================
    mySocket.on('loading', function (data) {
      console.log('loading', data);
    });

    mySocket.on('send:message', function (message) {
      $scope.messages.push(message);
    });

    mySocket.on('change:name', function (data) {
      changeName(data.oldName, data.newName);
    });

    mySocket.on('user:join', function (data) {
      $scope.messages.push({
        user: 'chatroom',
        text: 'User ' + data.name + ' has joined.'
      });
      $scope.users.push(data.name);
    });
  });
