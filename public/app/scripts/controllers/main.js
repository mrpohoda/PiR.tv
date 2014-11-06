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
        if (movies && movies.data) {
          $scope.foundItems = movies.data;
        }
        else {
          $scope.foundItems = [];
        }
        $scope.searchValue = '';
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

    // Socket listeners
    // ================
    mySocket.on('loading', function (data) {
      console.log('loading', data);
    });

    mySocket.on('video', function (data) {
      var action = data.action,
        movie = data.video;

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

    mySocket.on('playlist', function (data) {
      $scope.playlist = data.data;
    });
  });
