'use strict';

angular.module('myApp')
  .controller('MainCtrl', function ($rootScope, $scope, $http, $timeout, youtube, mySocket, ENV) {
    $scope.foundItems = [];
    $scope.searchValue = '';
    $scope.nowPlaying;

    // listen for the event in the relevant $scope
    $rootScope.$on('showFavourites', function (event, data) {
      showFavourites();
    });

    $scope.search = function (query) {
      var params = {
        query: query,
        limit: 50
      };
      youtube.getMovies(params).then(function (movies) {
        $scope.foundItems = movies.data;
        $scope.searchValue = '';
      });
    };

    $scope.isPlaying = function (movie) {
      return $scope.nowPlaying && movie.id === $scope.nowPlaying.id;
    }

    $scope.play = function (movie) {
      mySocket.emit('video', {
        action: 'play',
        video: movie
      });
    };

    $scope.pause = function (movie) {
      mySocket.emit('video', {
        action: 'pause',
        video: movie
      });
    };

    $scope.stop = function (movie) {
      mySocket.emit('video', {
        action: 'stop',
        video: movie
      });
    };

    function showFavourites() {
      var host = ENV.apiUrl || document.location.origin;
      $.get(host + '/video/favourite', function (data) {
        $scope.$apply(function () {
          $scope.foundItems = data;
        });
      });
    }

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

    mySocket.on('video', function (data) {
      var action = data.action,
        movie = data.video;

      alert(action);

      if (action === 'play') {
        $scope.nowPlaying = movie;
      }
      else if (action === 'pause') {
        $scope.nowPlaying = movie;
      }
      else if (action === 'stop') {
        $scope.nowPlaying = null;
      }
    });
  });
