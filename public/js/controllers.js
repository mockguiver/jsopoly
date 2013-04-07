'use strict';

/* Controllers */

function altCtrl($scope, socket, $location, session) {

  $scope.logged = session.logged;
  $scope.username = session.username;

  socket.on('get:last:posts:result', function (data) {
    if (!data.error)
      $scope.lastPosts = data.posts;
  });

  socket.on('get:last:comments:result', function (data) {
    if (!data.error)
      $scope.lastComments = data.comments;
  });

  $scope.sync = function (view) {
    socket.emit('get:posts', {view: view});
  };

  socket.emit('get:last:posts',{});
  socket.emit('get:last:comments',{});
  socket.emit('get:posts',{view:'top'});

}
altCtrl.$inject = ['$scope', 'socket','$location','session'];

function listCtrl($scope, socket, $location, session) {

  socket.on('get:posts:result', function(data) {
    $scope.list = data;
  });

  socket.on('submit:vote:result',function(data) {

    var index = (function () {
      var result = -1;
      var i=0;
      while (i< $scope.list.length) {
        if ($scope.list[i]._id == data.id) {
          result = i;
          break;
        } else {
          i++;
        }
      }
      return result;
    })();

    if (!data.error) {
      $scope.list[index].votes++;
    } else {
      $scope.list[index].errorOnVote = true;
      $scope.list[index].errorType = data.result;
    }
  });

  $scope.vote = function(id) {
    socket.emit('submit:vote',{id:id,voter:session.username});
  };


}
listCtrl.$inject = ['$scope', 'socket','$location','session'];

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


function detailCtrl($scope, socket, $routeParams,session) {

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

    if (!data.error) {
      $scope.votes++;
    } else {
      $scope.errorOnVote = true;
      $scope.errorType = data.result;
    }

  });

  $scope.vote = function(id) {
    socket.emit('submit:vote',{id:id,voter:session.username});
  };

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

    var info = {
      username: session.username,
      key: session.key
    };

    socket.emit('submit:comment', {commentData:commentData, info:info});
  };
}
detailCtrl.$inject = ['$scope','socket','$routeParams','session'];

function loginCtrl($scope, socket, $location, session, mycrypto)  {

  socket.on('submit:login:result',function(data) {

    var decryptedData = mycrypto.decode(data);
    var data = JSON.parse(decryptedData);

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
    var encoded = mycrypto.encode({username:$scope.username, password: $scope.password});
    socket.emit('submit:login',encoded);
  };

}
loginCtrl.$inject = ['$scope', 'socket','$location','session','mycrypto'];

function registerCtrl($scope,socket,$location,mycrypto) {

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
  };

  var checkPassword = function () {
    if ($scope.password != $scope.vpassword) {
      $scope.pwdError = "Password don't match";
      return false;
    } else return true;
  };

  $scope.register = function() {

    var mailChecked = checkEmail();
    var passwordChecked = checkPassword();
    var encoded = mycrypto.encode({username:$scope.username, password: $scope.password,email: $scope.email});

    if (mailChecked && passwordChecked) {
      socket.emit('submit:register',encoded);
    }
  }

}
registerCtrl.$inject = ['$scope','socket','$location','mycrypto'];


function aboutCtrl($scope) {

}
aboutCtrl.$inject = ['$scope'];


function profileCtrl($scope,socket,session,$location) {
  $scope.logout = function () {
    session.del();
    session.logged=false;
    session.username = null;
    session.key = null;
    $scope.$parent.logged = false;
    $location.url('/');
    };

  socket.on('get:userdata:result', function (data) {
    if (!data.error) {
      $scope.username = data.username;
      $scope.karma = data.karma;
    }
  });

  socket.emit('get:userdata', {username: session.username});
}
profileCtrl.$inject = ['$scope','socket','session','$location'];
