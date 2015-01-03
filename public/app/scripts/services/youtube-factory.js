'use strict';

angular.module('myApp.youtube.service', [
  // 'publicApp.config'
])
  .factory('youtube', function ($http, $q, ENV) {
    var youtubeFactory = {};
    var host = ENV.apiUrl || document.location.origin;

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
      if (!movies.feed.entry) {
        return items;
      }
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

    youtubeFactory.getFavouriteCategories = function () {
      return youtubeFactory.getFavourites().then(function (data) {
        var categories = [],
          category;
        angular.forEach(data, function (value, key) {
          category = value.category;
          if (category && categories.indexOf(category) < 0) {
            categories.push(category);
          }
        });
        return categories;
      });
    };

    youtubeFactory.getFavourites = function () {
      return $.get(host + '/video/favourite');
    };

    return youtubeFactory;
  });
