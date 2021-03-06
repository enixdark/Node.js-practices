var express = require('express');
var router = express.Router();
// var notes = require('../models/notes')
var util = require('util');
var users = require('./users');
var notes = undefined;
router.configure = function(params){
	notes = params.model;
}


// router
// .get('/noteadd',function(req,res,next){
// 	res.render('noteedit', {
// 		title: "Add a Note",
// 		docreate: true,
// 		notekey: "",
// 		note: undefined
// 	});
// })
// .get('/noteedit',function(req,res,next){
// 	res.render('noteedit', {
// 		title: "Edit a Note",
// 		docreate: false,
// 		notekey: req.query.key,
// 		note: notes.read(req.query.key)
// 	});
// })
// .get('/notedestroy',function(req,res,next){
// 	if(req.query.key){
// 		notes.delete(req.query.key);
// 	}
// 	res.redirect('/notes');
// });

// router
// .post('/notesave',function(req,res,next){
// 	if(req.body.docreate === "create"){
// 		notes.create(req.body.notekey,req.body.title,req.body.body);
// 	}
// 	else{
// 		notes.update(req.body.notekey,req.body.title,req.body.body)
// 	}
// 	res.redirect('noteview?key=' + req.body.notekey);
// });

// router.get('/noteview',function(req,res,netx){
// 	var note = undefined;
// 	if(req.query.key){
// 		note = notes.read(req.query.key);
// 	}
// 	res.render('noteview',{
// 		title:note ? note.title : "",
// 		notekey:req.query.key,
// 		note:note
// 	})
// });

var readNote = function(key, user,res, done) {
	// var _key = key.split('.').shift();
	var _key = key;
	console.warn(key);
	notes.read(_key,
		function(err, data) {
			util.log(data);
			if (err) {
				res.render('error', {
					title: "Error",
					user: user ? user : undefined,
					error: "Could not found note " + key
				});
				done(err);
			} else done(null, data);
		});
}

router
.get('/',users.ensureAuthenticated,function(req,res,next){
	notes.titles(function(err,titles){
		util.log(JSON.stringify(titles));

		if(err){
			res.render('error', {
				title: "Error",
				user: req.user ? req.user : undefined,
				error: "Could not found note " + err
			});
		}
		res.render('index', { title: 'Notes',
			notes:titles,
			user: req.user ? req.user : undefined
		});
	});
})
.get('/noteadd',users.ensureAuthenticated,function(req,res,next){
	var user = req.user ? req.user : undefined;

	res.render('noteedit', {
		title: "Add a Note",
		docreate: true,
		notekey: "",
		user: user,
		note: undefined
	});
})
.get('/noteedit',users.ensureAuthenticated,function(req,res,next){
	var user = req.user ? req.user : undefined;
	if(req.query.key){
		readNote(req.query.key,user,res,function(err,data){
			if(err){
				res.render('error',{
					title:'Error',
					error:"Not found The data" + err
				});
			}
			res.render('noteedit',{
				title:'Edit a Note',
				docreate:false,
				user: user,
				notekey:req.query.key,//req.query.key.split('.').shift(),
				note:data
			});
		});
	}
})
.get('/notedestroy',users.ensureAuthenticated,function(req,res,next){
	var user = req.user ? req.user : undefined;

	if(req.query.key){
		notes.delete(req.query.key,function(err){
			if(err){
				res.render('error',{
					title:'Error',
					user: user,
					error:'Not found The data' + err
				});
			}
			res.redirect('/notes');
		})
	}
})
.get('/noteview',function(req,res,next){
	if(req.query.key){
		var user = req.user ? req.user : undefined;
		readNote(req.query.key,user,res,function(err,data){
			if(err){
				res.render('error',{
					title:'Error',
					user: user,
					error:'Not found The data' + err
				});
			}
			res.render('noteview',{
				title: data['title'],
				user: user,
				notekey: req.query.key,
				note: data
			});
		});
	}
});

router.post('/notesave',users.ensureAuthenticated,function(req, res, next) {
	util.log(req.body.docreate);
	var user = req.user ? req.user : undefined;

	((req.body.docreate === "create")
		? notes.create : notes.update
		)(req.body.notekey, req.body.title, req.body.body,
		function(err) {
			util.log("Hello");
			if (err) {
				res.render('error', {
					title: "Could not update file" + err,
					user: user,
					error: err
				});
			} else {
				res.redirect('noteview?key='+req.body.notekey);
			}
		});
	});


module.exports = router;
