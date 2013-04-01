'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('alt.services', []).
  value('version', '0.1').
  factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  }).
  factory('store',function ($window) {
    return {
      save: function (item) {
        $window.localStorage.setItem('alt',JSON.stringify(item));
      },
      get: function () {
        return JSON.parse($window.localStorage.getItem('alt'));
      },
      del: function () {
        $window.localStorage.removeItem('alt');
      }
    }
  });
