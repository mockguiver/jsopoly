'use strict';

/* Controllers */

function altCtrl($scope, socket, $routeParams, $window, $location) {

	$scope.sync = function (status) {
		socket.emit('chgfilter', {status: status});

		// if we are out of list view we return to that view
		if ($location.path() != '/') { $location.path('/');	}

	}
}
altCtrl.$inject = ['$scope', 'socket','$routeParams','$window','$location'];

function listCtrl($scope, socket, $routeParams, $window) {

	socket.on('init', function(data) {
		$scope.list = data;
	});

	socket.on('chgfilter', function(data) {
		$scope.list = data;
	});

}
listCtrl.$inject = ['$scope', 'socket','$routeParams','$window'];

function putCtrl($scope,socket) {

	socket.on('post:ok', function(data) {
		$scope.result = "OK !"
	});

	$scope.put = function () {
		
		var post = {
			author: $scope.author,
			title: $scope.title,
			description: $scope.description, 
			votes: 0,
			link: $scope.link,
			comments: [],
			status: 'upc'
		}

		$scope.action = 'Inserted ... ';
		socket.emit('put:post', post);

	}
}
putCtrl.$inject = ['$scope','socket'];


function detailCtrl($scope, socket, $routeParams) {

	socket.on('get:post', function(data) {

		$scope.id = data._id;
		$scope.author = data.author;
		$scope.date = data.date;
		$scope.title = data.title;
		$scope.description = data.description; 
		$scope.votes = data.votes;
		$scope.link = data.link;
		$scope.comments = data.comments;

	});

	socket.emit('get:post', {id: $routeParams.id});
}
detailCtrl.$inject = ['$scope', 'socket','$routeParams'];

function loginCtrl($scope,socket,$routeParams,store) {

	socket.on('login',function(data) {
		store.save({username: data.username});
	})

	$scope.login = function () {
		socket.emit('login',{username:$routeParams.username, password: $routeParams.password});
	}

}
loginCtrl.$inject = ['$scope','socket','$routeParams'];