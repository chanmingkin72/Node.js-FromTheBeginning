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
    res.send( req.params );
});


app.get( "/rest/:table", auth, function( req, res ) {
    res.send( "Request: " + req.params.table );
});
app.get( "/rest/:table/:id", auth, function( req, res ) {
    res.send( req.params );
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
        console.log( "No valid user" );
        res.status( 404 ).send( "No valid user" );
        return;
    }
        
    next();
}