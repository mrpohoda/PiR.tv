var app = angular.module('myApp');

app.directive('myMovieControls', function (mySocket) {
  return {
    scope: {
      movie: '=',
      playing: '='
    },
    restrict: 'E',
    replace: 'true',
    templateUrl: '../../views/movie-controls.html',
    link: function (scope, element, attr) {
      // play movie
      scope.play = function () {
        // indicate that movie is loading - this flag will be reseted once the movie starts playing
        scope.isLoading = true;
        mySocket.emit('video', {
          action: 'play',
          video: scope.movie
        });
      };

      // pause movie
      scope.pause = function () {
        mySocket.emit('video', {
          action: 'pause',
          video: scope.movie
        });
      };

      // stop movie
      scope.stop = function () {
        mySocket.emit('video', {
          action: 'stop',
          video: scope.movie
        });
      };

      // add movie to favourites
      scope.addFavourite = function () {
        mySocket.emit('video', {
          action: 'favourite',
          video: scope.movie
        });
      };

      // add movie to current playlist
      scope.addToQueue = function () {
        mySocket.emit('video', {
          action: 'queue',
          video: scope.movie
        });
      };

      // helper method to say if the movie is currently playing
      scope.isPlaying = function () {
        var playing = scope.playing && scope.movie.id === scope.playing.id;
        if (playing && scope.isLoading) {
          scope.isLoading = false;
        }
        return playing;
      };

      scope.isPaused = function () {
        if (!scope.playing || scope.isPlaying() === false) {
          return true;
        }
        return scope.playing.isPaused;
      }
    }
  };
});
