var express       = require('express');
var http          = require('http');
var mongoose = require('mongoose');
var router        = express.Router();
var trelloWrapper = require('../modules/trello-wrapper');
var extension     =  require('../modules/extension-controller');

mongoose.connect('mongodb://localhost/trello-sync-list');
var con      = mongoose.connection;
con.on('error' , console.error.bind(console, 'connect error:'));
con.once('open' ,function() { console.log("Mongo connection online");});

/**
 * Routes
 */
router
// For WebHook HEAD check
.get('/ListHook',function(req,res) {
	res.status(200).end();
})

//Several Hook Routes
.post('/CardHook', function(req,res) {
	trelloWrapper.logAction(req);
	res.sendStatus(200);
})
.post('/ListHook', function(req,res) {
	trelloWrapper.logAction(req);
	trelloWrapper.listHookController(req);
	res.sendStatus(200);
})
.post('/BoardHook', function(req,res) {
	trelloWrapper.logAction(req);
	res.sendStatus(200);
})

//Cient-Endpoints

.get('/reg/:id/:type', function(req,res) {
	trelloWrapper.registerController(req);
})

.get('/sync/:id1/:id2',function(req,res) {
	trelloWrapper.setNewSyncController(req);
})


//Client Render Routes
.get('/', function (req, res) {
	res.render('index', { title: 'Trello-List-Sync' });
})

//Configuration Page
.get('/config', function (req,res) {
	res.render('config');	
})

//Register Page for new Hook
.get('/reg', function (req,res) {
	res.render('newhook');
})

//Register Page for new Sync
.get('/sync',function (req,res) {
	trelloWrapper.getAllSyncListFromDatabase(function(data){
		console.log(data);
		res.render('syncList', {data:data});
	})
})
//-----------------------------------------
//Routes for Extension

.get('/extSync/:boardname',function(req,res){
	// res.send('OK');
	extension.getBoardIdByName(req.params.boardname,function(err,boardid){
		if (err || boardid==0) {
			console.error(err); 
			res.sendStatus(404); 
		}else{
			extension.getListofBoard(boardid,function(data){
				extension.getSyncedListsOfBoard(data,function(docs){
					res.send(docs);
				});
			});
		}
	});

})

.get('/extSync/:board/',function(req,res){
	extension.getListofBoard(req.params.board,function(data){
		extension.getSyncedListsOfBoard(data,function(docs){
			res.json(docs);
		});
	});

})



;





module.exports = router;
