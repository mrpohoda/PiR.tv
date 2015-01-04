var app = angular.module('myApp');

app.directive('myMovieControls', function ($rootScope, $timeout, mySocket) {
  return {
    scope: {
      movie: '=',
      playing: '=',
      favouriteCategories: '=',
      index: '@'
    },
    restrict: 'E',
    replace: 'true',
    templateUrl: '../../views/movie-controls.html',
    link: function (scope, element, attr) {
      // listen for playAll event and play this movie
      // use timeout because there are potentionally more movies and we don't
      // want to overhead raspberry with too many downloads at once
      var unbindPlayAll = $rootScope.$on('playAll', function (event, data) {
        $timeout(function () {
          scope.play();
        }, scope.index * 1000 * 3);
      });

      // when this directive is destroyed, unbind listening to subscribed events
      // otherwise there would be multiple calls
      scope.$on('$destroy', function () {
        unbindPlayAll();
      });

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

      // emit favorite update to the server
      function emitFavourite(movie, category) {
        movie.category = category;
        mySocket.emit('video', {
          action: 'favourite',
          video: movie
        });
      }

      // add movie to selected favourites category
      scope.addFavourite = function (category) {
        emitFavourite(scope.movie, category);
      };

      // create new favorite category and add selected movie to it
      scope.createFavouriteCategory = function () {
        var category = window.prompt('Enter new category');
        if (category) {
          scope.favouriteCategories.push(category);
          emitFavourite(scope.movie, category);
        }
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
