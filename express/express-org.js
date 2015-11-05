var config      = require('./config.json'),
    express     = require('express'),
    app         = express(),
    
    router      = express.Router();

app.use( "/rest", auth, router );

router.get( "/:table", function( req, res ) {
    res.send( "Request: " + req.params.table );
});
router.get( "/:table/:id", function( req, res ) {
    res.send( req.params );
});
 
app.use( function( req, res, next ) {
    console.log( "hi", req.url );
    next();
    console.log("way back");
});

app.get( "/rest/:table", function( req, res ) {
    res.send( "Request: " + req.params.table );
});
app.get( "/rest/:table/:id", function( req, res ) {
    res.send( req.params );
});

app.get( "/", function( req, res ) {
    console.log( "req" );
    res.send( "Hello World" );
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