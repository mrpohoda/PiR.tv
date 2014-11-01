"use strict";angular.module("myApp",["ngRoute","config","myApp.youtube.service"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("config",[]).constant("ENV",{name:"development",apiUrl:"http://localhost:8080",socketUrl:"http://localhost:8080"}),angular.module("myApp").controller("MainCtrl",["$rootScope","$scope","$http","$timeout","youtube","mySocket","ENV",function(a,b,c,d,e,f,g){function h(){$.get(g.apiUrl+"/video/favourite",function(a){b.$apply(function(){b.foundItems=a})})}b.foundItems=[],b.searchValue="",b.nowPlaying,a.$on("showFavourites",function(){h()}),b.search=function(a){var c={query:a,limit:50};e.getMovies(c).then(function(a){b.foundItems=a.data,b.searchValue=""})},b.isPlaying=function(a){return b.nowPlaying&&a.id===b.nowPlaying.id},b.play=function(a){f.emit("video",{action:"play",video:a})},b.pause=function(a){f.emit("video",{action:"pause",video:a})},b.stop=function(a){f.emit("video",{action:"stop",video:a})},b.addFavourite=function(a){f.emit("video",{action:"favourite",video:a})},f.on("loading",function(a){console.log("loading",a)}),f.on("video",function(a){var c=a.action,d=a.video;alert(c),"play"===c?b.nowPlaying=d:"pause"===c?b.nowPlaying=d:"stop"===c&&(b.nowPlaying=null)})}]),angular.module("myApp").controller("HeaderCtrl",["$rootScope","$scope",function(a,b){b.showFavourites=function(){a.$broadcast("showFavourites",{someProp:"Sending you an Object!"})}}]),angular.module("myApp.youtube.service",[]).factory("youtube",["$http",function(a){function b(a,b){return a=angular.isArray(a)?a:[a],a.concat(b)}function c(a){for(var b,c=[],d=0;d<a.feed.entry.length;d++)b=a.feed.entry[d],c.push({id:b.id.$t.split("/")[6],title:b.title.$t,preview:b.media$group.media$thumbnail[1].url,duration:b.media$group.yt$duration.seconds});return c}var d={},e=function(){return"http://gdata.youtube.com/feeds/api/videos?alt=json"};return d.getMovies=function(d){return a.get(e()+"&&q="+escape(d.query)+"&max-results="+d.limit,{transformResponse:b(a.defaults.transformResponse,function(a){return c(a)})})},d}]),angular.module("myApp").factory("mySocket",["$rootScope","ENV",function(a,b){var c=io.connect(b.socketUrl);return{on:function(b,d){c.on(b,function(){var b=arguments;a.$apply(function(){d.apply(c,b)})})},emit:function(b,d,e){c.emit(b,d,function(){var b=arguments;a.$apply(function(){e&&e.apply(c,b)})})}}}]),angular.module("myApp").filter("secondsToString",function(){return function(a){a=parseInt(a,10);var b=parseInt(a/3600)%24,c=parseInt(a/60)%60,a=a%60,d=(10>b?"0"+b:b)+":"+(10>c?"0"+c:c)+":"+(10>a?"0"+a:a);return d}});