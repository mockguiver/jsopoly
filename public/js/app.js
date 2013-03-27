'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('alt', ['alt.filters', 'alt.services', 'alt.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/list', controller: listCtrl});
    $routeProvider.when('/put', {templateUrl: 'partials/put', controller: putCtrl});
    $routeProvider.when('/detail/:id', {templateUrl: 'partials/detail', controller: detailCtrl});
    $routeProvider.otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
  }]);