var config      = require('./config.json'),
    express     = require('express'),
    app         = express(),
    favicon     = require('serve-favicon'),
    
    router      = express.Router();

app.use( favicon( __dirname + '/public/favicon.ico' ) );

app.use( function( req, res, next ) {
    var start   = new Date;
    console.log( "way down", req.url );
    
    next();
    
    console.log( 'way back' );
    console.log( 'Response-Time', new Date - start );
});

app.use( "/rest", auth, router );

router.get( "/:table", function( req, res ) {
    res.send( "Request: " + req.params.table );
});
router.get( "/:table/:id", function( req, res ) {
    process.nextTick( function() {
        console.log( "req", req.params );
        res.send( req.params );
    });
});

app.get( "/", function( req, res ) {
    
    process.nextTick( function() {
        console.log( "req" );
        res.send( "Hello World" );
    });
});

app.get( "*", function( req, res ) {
    res.status( 503 ).send( "Nope!" );
});


app.listen( config.port );

// auth
function auth( req, res, next ) {
    
    // check for user
    if (!req.query.user) {
        console.log( "Not a valid user" );
        res.status( 500 ).send( "Not a valid user" );
        return;
    }

    // valid user
    console.log( "Valid user" );
    next();
}