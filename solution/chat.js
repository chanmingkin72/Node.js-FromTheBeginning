var express     = require('express'),
    app         = express(),
    
    nunjucks    = require('nunjucks'),
    
    server      = require('http').createServer( app ).listen( 80 ),
    io          = require('socket.io').listen( server ),
    
    numConn     = 0;
    
nunjucks.configure( 'views', {
    autoescape:     true,
    noCache:        true,
    express:        app
});

app.use( express.static( './client' ) );

app.get( "/", function( req, res ) {
    res.render( "index.html" );
});

io.on( 'connection', function(socket) {

    function login ( name ) {
        console.log( "login", name );
        socket.nickname     = name;
    }

    numConn     += 1;
    console.log( "connected", numConn );

    // tell the socket to identify (for relogin after restart of node session)
    socket.emit( "relogin", {}, login );

    // event for login from socket
    socket.on( "login", login );

    // socket sends message
    socket.on( "sendMessage", function( msg ) {
        console.log( "send message", numConn, socket.nickname, msg );

        // broadcast message to all subscribed sockets
        io.emit( "newMessage", {
            name:       socket.nickname,
            msg:        msg
        } );
    });

    socket.on( "disconnect", function() {
        numConn     -= 1;
        console.log( "disconnect", numConn );
    });
});