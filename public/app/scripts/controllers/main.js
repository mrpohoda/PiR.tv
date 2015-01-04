'use strict';

angular.module('myApp')
  .controller('MainCtrl', function ($rootScope, $scope, youtube, mySocket) {
    $scope.foundItems = [];
    $scope.searchValue = '';
    $scope.nowPlaying;

    youtube.getFavouriteCategories().then(function (data) {
      $scope.favouriteCategories = data;
    });

    youtube.getFavourites().then(function (data) {
      $scope.favourites = data;
      $scope.foundItems = data;
    });

    // listen for the event in the relevant $scope
    $rootScope.$on('showFavourites', function (event, data) {
      showFavourites(data.category);
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

    /**
     * play all videos currently visible
     * @return {[type]} [description]
     */
    $scope.playAll = function () {
      $rootScope.$broadcast('playAll', {});
    };

    function showFavourites(category) {
      if (category === 'All favourites') {
        $scope.foundItems = $scope.favourites;
      }
      else {
        var items = [];
        angular.forEach($scope.favourites, function (movie) {
          if (movie.category === category) {
            items.push(movie);
          }
        });
        $scope.foundItems = items;
      }
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
