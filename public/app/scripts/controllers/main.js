'use strict';

angular.module('myApp')
  .controller('MainCtrl', function ($scope, $http, youtube, mySocket) {
    $scope.foundItems = [];
    $scope.searchValue = '';
    $scope.nowPlaying;
    var host = document.location.origin;

    $scope.search = function (query) {
      var params = {
        query: query,
        limit: 30
      };
      youtube.getMovies(params).then(function (movies) {
        $scope.foundItems = movies.data;
        $scope.searchValue = '';
      });
    };

    $scope.play = function (movie) {
      if ($scope.nowPlaying && movie.id === $scope.nowPlaying.id) {
        $scope.pause(movie);
        return;
      }

      // if there is previous movie still playing, stop it
      if ($scope.nowPlaying) {
        $scope.stop($scope.nowPlaying);
      }

      movie.isPlaying = true;
      $scope.nowPlaying = movie;
      mySocket.emit('video', {
        action: 'play',
        video_id: movie.id
      });
    };

    $scope.pause = function (movie) {
      movie.isPlaying = !movie.isPlaying;
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

    $scope.showFavourites = function () {
      $.get(host + '/video/favourite', function (data) {
        $scope.$apply(function () {
          $scope.foundItems = data;
        });
      });
    };

    $scope.addFavourite = function (movie) {
      mySocket.emit('video', {
        action: 'favourite',
        video: movie
      });
    };

    // Socket listeners
    // ================
    mySocket.on('loading', function (data) {
      console.log('loading', data);
    });

    mySocket.on('finish', function (data) {
      $scope.nowPlaying.isPlaying = false;
      $scope.nowPlaying = null;
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
