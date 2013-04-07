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
  factory('mycrypto',function () {

    function enc(str) {
      var encoded = "";
      for (var i=0; i<str.length;i++) {
        var a = str.charCodeAt(i);
        var b = a ^ 123;    // bitwise XOR with any number, e.g. 123
        encoded = encoded+String.fromCharCode(b);
      }
      return encoded;
    }

    return {
      encode: function (text) {
        return enc(JSON.stringify(text))
      },
      decode: function (text) {
          return enc(text)
      }
    }
  }).
  factory('store',function ($window) {
    return {
      save: function (key,item) {
        $window.localStorage.setItem(key,JSON.stringify(item));
      },
      get: function (key) {
        return JSON.parse($window.localStorage.getItem(key));
      },
      del: function (key) {
        $window.localStorage.removeItem(key);
      }
    }
  }).
  factory('session',function (store) {

    var logged = false;
    var username = null;
    var key = null;
    var origin = '/';
    var init = true;

    var mysession = store.get('altSession');

    if (mysession && mysession.username) {
      logged = true;
      username = mysession.username;
      key = mysession.key;
    }

    var save = function (data) {
      store.save('altSession',{username:data.username, key: data.key});
    };

    var del = function () {
      store.del('altSession');
    };

    return {
      logged: logged,
      username: username,
      key:key,
      save: save,
      del:del,
      init: init
    }
  });

