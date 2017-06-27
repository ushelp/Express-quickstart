const express = require('express')

/* CORS */
const cors = require('cors')

/* Body Parser */
const bodyParser = require('body-parser');
const multer = require('multer');

/* Logger */
const logger = require('morgan');
const winston = require('winston');

/* Utils */
const path = require('path')
const favicon = require('serve-favicon')
const compression = require('compression')


/* Session & Cookies */
const cookieParser = require('cookie-parser')
const session = require('express-session');


// Application
const app = express()


/**
 * Template Engine (EasyTemplatJS)
 */
var fs = require('fs')
var Et = require('easytemplatejs');
var cache = true;  // Use Cache?
var cacheTpl = {}; 
app.engine('etj', function(filePath, data, callback) {
	fs.readFile(filePath, function(err, content) {
		if(err) return callback(err)
		var compiled;
		if(cache) {
			if(!cacheTpl[filePath]) {
				cacheTpl[filePath] = Et.template(content);
			}
			compiled = cacheTpl[filePath];
		} else {
			compiled = Et.template(content);
		}
		var rendered = compiled(data);
		return callback(null, rendered)
	})
})
app.set('views', './views') 
app.set('view engine', 'etj') 


// Logging
winston.level = 'debug'; // Winston logging level: error, warn, info, verbose, debug
app.use(logger('dev')); // Morgan logging level: combined, common, dev, short, tiny

app.use(compression()) // Compress
app.use(cors()) // CORS
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))) // favicon
app.use(cookieParser()) // Cookies
app.use(express.static('public')) // static



// Redis Session presists
// Memory Session temporary
app.use(session({
	secret: 'se3r4t', 
	name: 'nsessionId', 
	resave: true, 
	rolling: true, 
	saveUninitialized: true, 
	cookie: {
		httpOnly: true,
		maxAge: 1000*60*30 
	}
}));
 
/*
const RedisStore = require('connect-redis')(session);

app.use(session({
    store: new RedisStore({
    	host:'127.0.0.1',
    	port:6379
    }),
    secret: 'se3r4t',
    resave: true, 
	rolling: true, 
	saveUninitialized: false, 
	cookie: {
		httpOnly: true,
		maxAge: 1000*60*30 // Session MaxAge(millisecond), Default is 24 Hours
	}
}));
*/


/* Body Parser */
app.use(bodyParser.json({type: 'application/*+json'}))
app.use(bodyParser.raw({type: 'application/vnd.custom-type'}))
app.use(bodyParser.text({type: 'text/html'}))
app.use(bodyParser.urlencoded({ extended: false }));  // create application/x-www-form-urlencoded parser  
app.use(bodyParser.json());  // create application/json parser 



/* Router */

var index = require('./routes/index');
var users = require('./routes/users');

app.use('/', index);
app.use('/users', users);

/* Exception Handler*/

// 404
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Server Exception

app.use(function(err, req, res, next) {
	if(res.headersSent) {
		return next(err)
	}
	res.locals.msg = err.message;
	res.locals.err = process.env.NODE_ENV != 'production' ? err : {};
	err.status = err.status || 500;
	res.status(err.status);
	res.render('error');
});



/**
 * Start Server
 */
const PORT=3000;
app.listen(PORT, function() {
	console.log(`Example app listening on port ${PORT}!`)
	console.log(process.env.NODE_ENV||"");
})


// If you don't use a process manager(like 'PM2''), this can prevent server crashes
//process.on('uncaughtException', function (err) {
//  console.log('Caught exception: ', err);
//});
