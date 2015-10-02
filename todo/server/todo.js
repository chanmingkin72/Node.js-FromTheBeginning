var express     = require('express'),
    app         = express(),
    
    server      = require('http').createServer( app ).listen( 80 ),
    io          = require('socket.io').listen( server )

    nunjucks    = require("nunjucks"),
    
    debug       = require("debug");
    
nunjucks.configure( 'views', {
    autoescape: true,
    express: app
});

app.use( express.static( '../client' ) );
app.use( express.static( '../../static' ) );

app.get( '/', function( rew, res ) {
    res.render( "index.html" );
});

io.on( 'connection', function(socket) {

    function login ( name ) {
        console.log( "login", name );
        socket.nickname     = name;
    }

    // tell the socket to identify (for relogin after restart of node session)
    socket.emit( "relogin", {}, login );

    // event for login from socket
    socket.on( "login", login );

});