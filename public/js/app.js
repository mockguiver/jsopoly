'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('alt', ['alt.filters', 'alt.services', 'alt.directives']).
  config(['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/list', controller: listCtrl});
    $routeProvider.when('/submit', {templateUrl: 'partials/submit', controller: submitCtrl});
    $routeProvider.when('/login', {templateUrl: 'partials/login', controller: loginCtrl});
    $routeProvider.when('/profile', {templateUrl: 'partials/profile', controller: profileCtrl});
    $routeProvider.when('/about', {templateUrl: 'partials/about', controller: aboutCtrl});
    $routeProvider.when('/register', {templateUrl: 'partials/register', controller: registerCtrl});
    $routeProvider.when('/detail/:id', {templateUrl: 'partials/detail', controller: detailCtrl});
    $routeProvider.otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
  }]);