'use strict';

/* Controllers */

function altCtrl($scope, socket, $location, session) {

  $scope.logged = session.logged;
  $scope.username = session.username;

  $scope.sync = function (view) {
    socket.emit('get:posts', {view: view});
    $location.path('/');
  }
}
altCtrl.$inject = ['$scope', 'socket','$location','session'];

function listCtrl($scope, socket, $routeParams, $window) {

  socket.on('get:posts:result', function(data) {
    $scope.list = data;
  });

  socket.on('submit:vote:result',function(data) {
    // TODO ABM Votes
  });

  $scope.vote = function(id) {
    socket.emit('submit:vote',{id:id});
  }

  socket.emit('get:posts',{view:'top'});
}
listCtrl.$inject = ['$scope', 'socket','$routeParams','$window'];

function submitCtrl($scope,socket,$location,session) {

  if (!session.logged) {
    session.origin = '/submit';
    $location.path('/login');
  }

  // Steps management
  $scope.phase2 = false;
  $scope.togglePhase = function () {
    $scope.phase2 = !$scope.phase2;
  };

  socket.on('submit:post:result', function(data) {
    if (!data.error) {
      $location.path('/detail/' + data.slug);
    }
  });

  $scope.submit = function () {

    var post = {
      title: $scope.title,
      description: $scope.description,
      link: $scope.link
    };

    var info = {
      username: session.username,
      key: session.key
    };
    socket.emit('submit:post', {post:post, info: info});
  }
}
submitCtrl.$inject = ['$scope','socket','$location','session'];


function detailCtrl($scope, socket, $routeParams) {

  socket.on('get:post:result', function(data) {

    $scope.id = data._id;
    $scope.author = data.author;
    $scope.date = data.date;
    $scope.title = data.title;
    $scope.description = data.description;
    $scope.votes = data.votes;
    $scope.link = data.link;
    $scope.anonymous = data.anonymous;
    $scope.slug = data.slug;
    $scope.comments = data.comments;

  });

  socket.on('submit:vote:result',function(data) {
    // TODO ABM Todos
  });

  socket.emit('get:post', {id: $routeParams.id});

  socket.on('submit:comment:result', function (data) {
     if (!data.error) {
       $scope.comments.push({body:$scope.textComment,author:$scope.author});
     }
  });

  $scope.submitComment = function () {
    var commentData = {
      id: $scope.id,
      author: $scope.author,
      body: $scope.textComment
    };

    socket.emit('submit:comment', commentData);
  };
}
detailCtrl.$inject = ['$scope','socket','$routeParams'];

function loginCtrl($scope, socket, $location, session)  {

  socket.on('submit:login:result',function(data) {
    if (data.error) {
      $scope.result = data.result;
    } else {
      session.save(data);
      $scope.$parent.logged = true;
      $scope.$parent.username = data.username;
      session.logged = true;
      session.username = data.username;
      $location.path(session.origin);
    }
  });

  $scope.login = function () {
    socket.emit('submit:login',{username:$scope.username, password: $scope.password});
  };

}
loginCtrl.$inject = ['$scope', 'socket','$location','session'];

function registerCtrl($scope,socket,$location) {

  socket.on('submit:register:result', function (data) {
    if (!data.error) {
      $location.path('/login');
    }
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
      socket.emit('submit:register',{username:$scope.username, password: $scope.password,email: $scope.email});
    }
  }

}
registerCtrl.$inject = ['$scope','socket','$location'];


function aboutCtrl($scope) {

}
aboutCtrl.$inject = ['$scope'];


function profileCtrl($scope,socket,session,$location) {
  $scope.logout = function () {
    session.del();
    session.logged=false;
    session.user = null;
    session.key = null;
    $scope.$parent.logged = false;
    $location.url('/');
    }
}
profileCtrl.$inject = ['$scope','socket','session','$location'];
