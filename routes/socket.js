

// Required libraries
var mongoose = require('mongoose');
mongoose.connect('localhost', '_altDB');


// Schema
var postModel = {
    author: String,
    date: { type: Date, default: Date.now },
    title: String,
    description: String,
    votes: Number,
    link: String,
    slug: String,
    anonymous: Number,
    comments: [
        {body: String, author: String}
    ]
};

var userModel = {
    username: String,
    password: String,
    karma: Number,
    key: String
}

// Models
var Post = mongoose.model('Post',postModel);
var User = mongoose.model('User',userModel);


module.exports = function (socket) {

  socket.on('get:posts', function(data) {

    if (data.view == 'top') {
      Post
        .where('votes').gte(25)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
        });
    } else if (data.status == 'pop') {
      Post
        .where('votes').gte(100)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
        });
    } else if (data.status == 'upc') {
      Post
        .where('votes').lte(25)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
        });
    } else {
      Post
        .where('votes').gte(25)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
      });
    }
  });

  socket.on('submit:post', function(data) {

    // TODO Karma ABM
    var user = User.findOne({username: data.info.username}, function (err,user) {

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

        var post = new Post(postdata);
        post.save();
        socket.emit('submit:post:result',{error:false,id:post._id});
      }
    });
  });

  socket.on('submit:comment', function (data) {
    Post.findById(data.id,function(err,post) {
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
    Post.findOne({slug:data.id}, function(err,doc) {
      socket.emit('get:post:result', doc);
    });
  });

  socket.on('submit:login', function(data) {
    User.findOne({username:data.username}, function (err,user) {
      if (!err && user) {
        if (user.password != data.password) {
            socket.emit('login', {error: true, result: 'Error - Wrong password'});
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

  socket.on('submit:register', function(data) {
    data.karma=0;
    data.key = 'logged';
    var user = new User(data);
    user.save();

    socket.emit('submit:register:result',{error:false});
  })

};
