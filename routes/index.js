var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	
	// Template Engine Data demo: app.locals, res.locals, locals
	req.app.locals.title="Express App";
	res.locals.email='xxx@yyy.zzz';
	res.render('index', { name: 'Jay', console: console });
});

module.exports = router;
