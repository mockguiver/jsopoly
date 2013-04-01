'use strict';

/* Controllers */

function altCtrl($scope, socket, $location, store) {

  $scope.logged = false;
  var localstorage = store.get();
  if (localstorage && localstorage.username) {
    $scope.logged = true;
    $scope.user = localstorage.username;
  }

	$scope.sync = function (status) {
		socket.emit('chgfilter', {status: status});

		// if we are out of list view we return to that view
		if ($location.path() != '/') { $location.path('/');	}
	}
}
altCtrl.$inject = ['$scope', 'socket','$location','store'];

function listCtrl($scope, socket, $routeParams, $window) {

	socket.on('init', function(data) {
		$scope.list = data;
	});

	socket.on('chgfilter', function(data) {
		$scope.list = data;
	});

  socket.on('vote',function(data) {

  });

  $scope.vote = function(id) {
    socket.emit('vote',{id:id});
  }

}
listCtrl.$inject = ['$scope', 'socket','$routeParams','$window'];

function submitCtrl($scope,socket,$location,store) {

  // Steps management
  $scope.phase2 = false;
  $scope.togglePhase = function () {
    $scope.phase2 = !$scope.phase2;
  };

  socket.on('put:post', function(data) {
    if (!data.error) {
      $location.path('/');
    }
  });

  $scope.submit = function () {

    // Submit Ctrl
    var logged = false;
    var user = null;
    var session = null;
    var localstorage = store.get();

    if (localstorage.username) {
      logged = true;
      user = localstorage.username;
      session = localstorage.session;
    }

    if (!logged) {
      $location.path('/login');
    } else {

      var post = {
        title: $scope.title,
        description: $scope.description,
        link: $scope.link
      };

      var info = {
        user: user,
        session: session
      }

      socket.emit('put:post', {post:post, info: info});
      }

    };
}
submitCtrl.$inject = ['$scope','socket','$location','store'];


function detailCtrl($scope, socket, $routeParams) {

	socket.on('get:post', function(data) {

		$scope.id = data._id;
		$scope.author = data.author;
		$scope.date = data.date;
		$scope.title = data.title;
		$scope.description = data.description; 
		$scope.votes = data.votes;
		$scope.link = data.link;
    $scope.slug = data.slug;
		$scope.comments = data.comments;

	});

	socket.emit('get:post', {id: $routeParams.id});

  socket.on('put:comment', function (data) {
     if (!data.error) {
       $scope.comments.push({body:$scope.comment,author:$scope.author});
     }
  });

  $scope.submitComment = function () {
    var commentData = {
      id: $scope.id,
      author: $scope.author,
      body: $scope.textComment
    };

    socket.emit('put:comment', commentData);
  };
}
detailCtrl.$inject = ['$scope','socket','$routeParams'];

function loginCtrl($scope, socket, $location, store)  {

	socket.on('login',function(data) {
    if (data.error) {
      $scope.result = data.result;
    } else {
      store.save({username: data.username,session: data.session});
      $location.path('/');
    }
  });

	$scope.login = function () {
		socket.emit('login',{username:$scope.username, password: $scope.password});
	};

}
loginCtrl.$inject = ['$scope', 'socket','$location','store'];

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
registerCtrl.$inject = ['$scope','socket','$routeParams','store'];


function aboutCtrl($scope) {

}
aboutCtrl.$inject = ['$scope'];


function profileCtrl($scope,socket,store,$location,$rootScope) {
  $scope.logout = function () {
    var session = store.get();
    if (session) {
      socket.emit('logout',session);
      store.del();
      $rootScope.logged = false;
      $location.url('/');
    }
  };
}
profileCtrl.$inject = ['$scope','socket','store','$location','$rootScope'];
