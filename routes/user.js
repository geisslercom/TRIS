var express = require('express');
var router = express.Router();

/* GET users listing. */
router

//Default Route
.get('/', function(req, res) {
  res.render('index', { title: 'Trello-List-Sync' });
})

//Configuration Page
.get('/config', function(req,res) {
	res.render('config');	
})

//Register Page for new Hook
.get('/reg', function(req,res) {
	res.render('newhook');
})

//Register Page for new Sync
.get('/sync',function (req,res) {
	res.render('syncList');
})
;

module.exports = router;
