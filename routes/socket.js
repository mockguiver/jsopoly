/* 
	Data abstraction library 
*/

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
    comments: [
        {body: String, date: Date, author: String}
    ]
};

var userModel = {
    username: String,
    password: String,
    karma: Number,
    session: String
}

// Models
var Post = mongoose.model('Post',postModel);
var User = mongoose.model('User',userModel);


module.exports = function (socket) {

	socket.on('chgfilter', function(data) {

    if (data.status == 'top') {
      Post
        .where('votes').gte(25)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('init', docs);
        });
    } else if (data.status == 'pop') {
      Post
        .where('votes').gte(100)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('init', docs);
        });
    } else if (data.status == 'upc') {
      Post
        .where('votes').lte(25)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('init', docs);
        });
    } else {
      Post
        .where('votes').gte(25)
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('init', docs);
      });
    }
  });

	socket.on('put:post', function(data) {

    var user = User.findOne({username: data.info.user}, function (err,user) {

      if (err) {
        socket.emit({error: true, errorcode:0, result: 'No user found'});
      } else if (user.session != data.info.session) {
        socket.emit({error: true, errorcode:1, result: "Session doesn't match"});
      } else {

        var postdata = {
          author: data.info.user,
          date: { type: Date, default: Date.now },
          title: data.post.title,
          description: data.post.description,
          votes: 0,
          link: data.post.link,
          comments: []
        }

        var post = new Post(postdata);
        post.save();
        socket.emit('post:ok',{});
      }
    });
	});

	socket.on('get:post', function(data) {
		Post.findById(data.id, function(err,doc) {
			socket.emit('get:post', doc);
		})
	})

	socket.on('login', function(data) {
        User.findOne({username:data.username}, function (err,user) {
            if (!err && user) {
                if (user.password != data.password) {
                    socket.emit('login', {error: true, result: 'error - worng password'});
                } else {
                    user.session = 'inventedsession';
                    user.save();
                    socket.emit('login', {error: false, username: data.username, session: user.session, result: 'OK!'});
                }
            } else {
                socket.emit('login', {result: 'error - no user'});
            }
        })
	})

    socket.on('register', function(data) {
        data.karma=0;
        data.session = 'logged';
        var user = new User(data);
        user.save();
        socket.emit('register',{result:'OK!'});
    })

};
