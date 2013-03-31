'use strict';

/* Controllers */

function altCtrl($scope, socket, $routeParams, $window, $location,store) {

  $scope.logged = false;
  var localstorage = store.get();
  if (localstorage.username) {
    $scope.logged = true;
    $scope.user = localstorage.username;
  }

	$scope.sync = function (status) {
		socket.emit('chgfilter', {status: status});

		// if we are out of list view we return to that view
		if ($location.path() != '/') { $location.path('/');	}

	}
}
altCtrl.$inject = ['$scope', 'socket','$routeParams','$window','$location','store'];

function listCtrl($scope, socket, $routeParams, $window) {

	socket.on('init', function(data) {
		$scope.list = data;
	});

	socket.on('chgfilter', function(data) {
		$scope.list = data;
	});

}
listCtrl.$inject = ['$scope', 'socket','$routeParams','$window'];

function submitCtrl($scope,socket) {

    $scope.phase2 = false;

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
		};

		$scope.action = 'Inserted ... ';
		socket.emit('put:post', post);

	};

    $scope.togglePhase = function () {
        $scope.phase2 = !$scope.phase2;
    };
}
submitCtrl.$inject = ['$scope','socket'];


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

function loginCtrl($scope,socket,$routeParams,store,$location) {

	socket.on('login',function(data) {
    if (data.error) {
      $scope.result = data.result;
    } else {
      store.save({username: data.username,session: data.session});
      location.path('/');
    }
  });

	$scope.login = function () {
		socket.emit('login',{username:$scope.username, password: $scope.password});
	};

}
loginCtrl.$inject = ['$scope','socket','$routeParams','store','$location'];

function registerCtrl($scope,socket,$routeParams,store) {

  socket.on('register', function (data) {
    $scope.action = 'Registered ...';
    $scope.result = data.result;
  });

  var checkEmail = function () {
    if (!/^([\w!.%+\-])+@([\w\-])+(?:\.[\w\-]+)+$/.test($scope.email)) {
      $scope.mailError = 'Email not valid';
      return false;
    } else return true;
  }

  var checkPassword = function () {
    if ($scope.password != $scope.vpassword) {
      $scope.pwdError = "Password don't match";
      return false;
    } else return true;
  }

  $scope.register = function() {

    var mailChecked = checkEmail();
    var passwordChecked = checkPassword();

    if (mailChecked && passwordChecked) {
      socket.emit('register',{username:$scope.username, password: $scope.password,email: $scope.email});
    }
  }

}
loginCtrl.$inject = ['$scope','socket','$routeParams','store'];


function aboutCtrl($scope) {

}
aboutCtrl.$inject = ['$scope'];