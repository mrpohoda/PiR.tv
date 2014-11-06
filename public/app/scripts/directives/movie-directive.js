var app = angular.module('myApp');

app.directive('myMovie', function () {
  return {
    scope: {
      movie: '=',
      playing: '='
    },
    restrict: 'E',
    replace: 'true',
    templateUrl: '../../views/movie.html'
  };
});
