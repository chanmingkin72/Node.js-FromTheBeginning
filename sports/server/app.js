var config      = require('./config.json'),

    co          = require('co'),

    express     = require('express'),
    app         = express(),
    
    server      = require('http').createServer( app ).listen( config.port ),
    io          = require('socket.io').listen( server ),

    data        = {
        webspeed:       require('./app/webspeed.js'),
        scl:            require('./app/scl.js'),
        jsdo:           require('./app/jsdo.js'), 
        akera:          require('./app/akera.js')
//        node4progress:  require('./app/node4progress.js') 
    },
 
    log         = require("debug")('app:main');
    
app.use( express.static( '../client' ) );
app.use( express.static( '../../static' ) );

app.get( '/data/:type/:table', function( req, res ) {

    co( function*() {
        
        log( 'data', req.params.type );

        // get data
        let result   = yield *data[ req.params.type ].get( { params: req.params, query: req.query } );

        // check if we can convert table
        if (req.query.result)
            result    = result && result[ req.query.result ];

        return result;
    })
    .then( function( data ) {
        // send data
        res.json( data );
    })
    .catch( function(err) {
        console.error( err );
        res.status( 502 ).send( err );
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

log( "app started" );