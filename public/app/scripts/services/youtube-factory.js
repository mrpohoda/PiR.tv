'use strict';

angular.module('myApp.youtube.service', [
  // 'publicApp.config'
])
  .factory('youtube', function ($http) {
    var youtubeFactory = {};

    var getBaseUrl = function () {
      return 'http://gdata.youtube.com/feeds/api/videos?alt=json';
    };

    function appendTransform(defaults, transform) {
      // We can't guarantee that the default transformation is an array
      defaults = angular.isArray(defaults) ? defaults : [defaults];

      // Append the new transformation to the defaults
      return defaults.concat(transform);
    }

    function transformYoutubeData (movies) {
      var items = [],
        entry;
      for (var i = 0; i < movies.feed.entry.length; i++) {
        entry = movies.feed.entry[i];

        items.push({
          id: entry.id.$t.split("/")[6],
          title: entry.title.$t,
          preview: entry.media$group.media$thumbnail[1].url,
          duration: entry.media$group.yt$duration.seconds
        });
      }
      return items;
    }

    youtubeFactory.getMovies = function (params) {
      return $http.get(getBaseUrl() + '&&q=' + escape(params.query) + "&max-results=" + params.limit, {
        transformResponse: appendTransform($http.defaults.transformResponse, function(value) {
          return transformYoutubeData(value);
        })
      });
    };

    return youtubeFactory;
  });
