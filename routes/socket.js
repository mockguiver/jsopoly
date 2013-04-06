


// Libs

var tools = require('./tools');
var db = require('../db/data');


module.exports = function (socket) {

  socket.on('get:posts', function(data) {

    if (data.view == 'top') {
      db.Post
        .where('votes').gte(25)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
        });
    } else if (data.view == 'pop') {
      db.Post
        .where('votes').gte(100)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
        });
    } else if (data.view == 'upc') {
      db.Post
        .where('votes').lte(25)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
        });
    } else {
      db.Post
        .where('votes').gte(25)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
      });
    }
  });

  socket.on('submit:post', function(data) {

    // TODO Karma ABM
    var user = db.User.findOne({username: data.info.username}, function (err,user) {

      if (err) {
        socket.emit('submit:post:result',{error: true, errorcode:0, result: 'No user found'});
      } else if (user.session != data.info.session) {
        socket.emit('submit:post:result',{error: true, errorcode:1, result: "Session doesn't match"});
      } else {

        var postdata = {
          author: data.info.username,
          date: { type: Date, default: Date.now },
          title: data.post.title,
          description: data.post.description,
          votes: 0,
          link: data.post.link,
          anonymous: 0,
          slug: tools.str2slug(data.post.title),
          comments: []
        }

        var post = new db.Post(postdata);
        post.save();
        socket.emit('submit:post:result',{error:false,slug:post.slug});
      }
    });
  });

  socket.on('submit:comment', function (data) {
    db.Post.findById(data.id,function(err,post) {
      if (err) {
        socket.emit('submit:comment:result',{error: true});
      } else {
        var commentData = {
          body : data.body,
          author: data.author
        }

        post.comments.push(commentData);
        post.save();

        socket.emit('submit:comment:result', {error: false});
      };
    });
  });


  socket.on('get:post', function(data) {
    db.Post.findOne({slug:data.id}, function(err,doc) {
      socket.emit('get:post:result', doc);
    });
  });

  socket.on('submit:login', function(data) {
    db.User.findOne({username:data.username}, function (err,user) {
      if (!err && user) {
        if (user.password != data.password) {
            socket.emit('submit:login:result', {error: true, result: 'Error - Wrong password'});
        } else {
            user.key = 'inventedsession';
            user.save();
            socket.emit('submit:login:result', {error: false, username: data.username, key: user.key, result: 'OK!'});
        }
      } else {
        socket.emit('submit:login:result', {error:true, result: 'Error - no user found'});
      }
    })
  })

  socket.on('get:last:posts', function(data) {
    db.Post
      .where('votes').lte(25)
      .limit(5)
      .exec(function(err,docs) {
        if (!err)
          socket.emit('get:last:posts:result',{error:false,posts: docs});
      });
  });

  socket.on('submit:register', function(data) {
    data.karma=0;
    data.key = 'logged';
    var user = new db.User(data);
    user.save();

    socket.emit('submit:register:result',{error:false});
  })

};
