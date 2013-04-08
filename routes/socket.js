'use strict';

// Libs

var tools = require('./tools');
var db = require('../db/data');


module.exports = function (socket) {

  socket.on('get:posts', function(data) {

    if (data.view == 'top') {
      db.Post
        .where('votes').gte(25)
        .sort('-votes')
        .limit(10)
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
        });
    } else if (data.view == 'pop') {
      db.Post
        .where('votes').gte(100)
        .limit(10)
        .sort('-votes')
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
        });
    } else if (data.view == 'upc') {
      db.Post
        .where('votes').lte(25)
        .limit(10)
        .sort('-votes')
        .exec(function (err, docs) {
          socket.emit('get:posts:result', docs);
        });
    } else { // Search   db.collection.find( { field : { $in : array } } );
      db.Post
        .find({keywords: {$in: [data.view]}})
        .exec(function(err, docs){
        if (!err) {
          socket.emit('get:posts:result',docs);
        }
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
        };

        var post = new db.Post(postdata);
        post.save();
        socket.emit('submit:post:result',{error:false,slug:post.slug});
      }
    });
  });

  socket.on('submit:comment', function (data) {

    var user = db.User.findOne({username: data.info.username}, function (err,user) {
      if (err) {
        socket.emit('submit:comment:result',{error: true, errorcode:0, result: 'No user found'});
      } else if (user.session != data.info.session) {
        socket.emit('submit:comment:result',{error: true, errorcode:1, result: "Session doesn't match"});
      } else {
        db.Post.findById(data.id,function(err,post) {
          if (err) {
            socket.emit('submit:comment:result',{error: true,errorcode:2,result: "Post not found"});
          } else {

            var commentData = {
              body : data.commentdata.body,
              author: data.commentdata.author
            };

            post.comments.push(commentData);
            post.save();

            var commentLinkData = {
              slug: post.slug,
              author: post.author,
              body: commentData.body.substr(0,30) + '...'
            };

            var commentLink = new db.Comment(commentLinkData);
            commentLink.save();

            socket.emit('submit:comment:result', {error: false});
          }
        });
      }
    })
  });


  socket.on('get:post', function(data) {
    db.Post.findOne({slug:data.id}, function(err,doc) {
      socket.emit('get:post:result', doc);
    });
  });

  socket.on('submit:login', function(data) {

    var decryptedData = tools.enc(data);
    var data = JSON.parse(decryptedData);
    var encoded = null;

    db.User.findOne({username:data.username}, function (err,user) {
      if (!err && user) {
        if (user.password != data.password) {
          encoded = tools.enc(JSON.stringify({error: true, result: 'Error - Wrong password'}));
        } else {
          user.key = 'inventedsession';
          user.save();
          encoded = tools.enc(JSON.stringify({error: false, username: data.username, key: user.key, result: 'OK!'}));
        }
      } else {
        encoded = tools.enc(JSON.stringify({error:true, result: 'Error - no user found'}));
      }
      socket.emit('submit:login:result',encoded);
    })
  });

  socket.on('get:last:posts', function(data) {
    db.Post
      .where('votes').lte(25)
      .limit(5)
      .exec(function(err,docs) {
        if (!err)
          socket.emit('get:last:posts:result',{error:false,posts: docs});
      });
  });

  socket.on('get:last:comments', function(data) {
    db.Comment
      .where('__v').equals(0)
      .limit(5)
      .exec(function(err,docs) {
        if (!err)
          socket.emit('get:last:comments:result',{error:false,comments: docs});
      });
  });


  socket.on('submit:register', function(data) {

    var decryptedData = tools.enc(data);
    var data = JSON.parse(decryptedData);

    db.User.findOne({username:data.username}, function (err, user) {
      if (!err) {
        if (user == null) {
          data.karma=0;
          data.key = 'logged';
          var user = new db.User(data);
          user.save();
          socket.emit('submit:register:result',{error:false});
        } else {
          socket.emit('submit:register:result',{error:true, result:'User exists in our Database'});
        }
      }
    });

  });

  socket.on('submit:vote', function (data) {

    var hasAlreadyVoted = function (vid,array) {
      var result = false;
      var i=0;
      while (i<array.length) {
        if (array[i].id == vid) {
          result = true;
          break
        }
        else i++;
      }
      return result;
    };

    var voterid = null;
    db.User.findOne({username:data.voter}, function (err, user) {
      if (!err) {
        if (user && user.username) {
          voterid = user.username;
        }

      db.Post.findById(data.id,function(err, post) {
        if (!err && post != null) {
          if (voterid == null) {
            if (post.anonymous >= 20) {
              socket.emit('submit:vote:result',{error:true, id:post._id, result:"Too much anonymous votes !"})
              return;
            } else {
              post.anonymous++;
            }
          } else if (hasAlreadyVoted(post._id,user.votes)) {
            socket.emit('submit:vote:result',{error:true, id:post._id, result:"You've already voted !"})
            return;
          } else {
            user.votes.push({id:post._id});
            user.save();
          }

          db.User.findOne({username:post.author}, function (err, author) {
             if (!err && author != null) {
               author.karma++;
               author.save();
             }
          });

          post.votes++;
          post.save();
          socket.broadcast.emit('submit:vote:result',{error:false, id: post._id});
        }
      });
      }
    })
  });

  socket.on('get:userdata', function(data) {
    db.User.findOne({username:data.username},function (err, user) {
      if (!err && user!=null) {
        socket.emit('get:userdata:result',{username:user.username, karma:user.karma});
      }
    })
  });

};
