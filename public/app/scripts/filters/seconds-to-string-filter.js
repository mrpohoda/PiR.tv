'use strict';

angular.module('myApp')
  .filter('secondsToString', function () {
    return function (seconds) {
      seconds = parseInt(seconds, 10);
      var hours = parseInt( seconds / 3600 ) % 24,
        minutes = parseInt( seconds / 60 ) % 60,
        seconds = seconds % 60;
      var duration = (hours < 10 ? "0" + hours : hours) + ":" +
        (minutes < 10 ? "0" + minutes : minutes) + ":" +
        (seconds  < 10 ? "0" + seconds : seconds);
      return duration;
    };
  });
