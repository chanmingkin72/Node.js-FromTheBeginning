var express     = require('express'),
    app         = express();
    
app.use( function( req, res, next ) {
    console.log( "hi", req.url );
    next();
    console.log("way back");
});

app.get( "/rest/:table", auth, function( req, res ) {
    res.send( "Request for", req.params.table );
});
app.get( "/rest/:table/:id", auth, function( req, res ) {
    res.send( req.params );
});

app.get( "/", function( req, res ) {
    console.log( "req" );
    res.send( "Hello World" );
});

app.listen( 80 );

// auth
function auth( req, res, next ) {
    
    // check for user
    if (!req.query.user)
        req.status( 404 ).send( "No valid user" );
        
    next();
}