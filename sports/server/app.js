var config      = require('./config.json'),

    express     = require('express'),
    app         = express(),
    
    server      = require('http').createServer( app ).listen( config.port ),
    io          = require('socket.io').listen( server ),

    data        = {
        webspeed:       require('./app/webspeed.js'),
        scl:            require('./app/scl.js'),
        jsdo:           require('./app/jsdo.js'),
        akera:          require('./app/akera.js'),
        node4progress:  require('./app/node4progress.js')
    },
    
    debug       = require("debug");
    
app.use( express.static( '../client' ) );
app.use( express.static( '../../static' ) );

app.get( '/data/:type/:table', function( req, res ) {

    data[ req.params.type ].get( { params: req.params, query: req.query }, function( err, data ) {
        if (err)
            return res.status( 502 ).send( err );

        // check if we can convert table
        if (req.query.result)
            data    = data && data[ req.query.result ];

        return res.json( data );
    });
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

    // data
    socket.on( "getdata", function( elm, callback ) {
        data[ elm.type ].get( elm, function( err, data ) {
            callback( err, data );
        });
    })

});