var config      = require( "../config.json" ),
    restify     = require( 'restify' ),
    async       = require('async'),
    url         = require('url'),
    scl         = config.scl;

module.exports	= {

    get:    function( msg, callback ) {
        var urlString   = scl.url + url.format( { query: { filter: JSON.stringify({ top: 10, skip: 0 }) } } );
        
        async.waterfall(
            [
                // connect to rest service
                function( callback ) {
                    connect( callback );
                },

                // call service
                function( client, callback ) {
                    client
                        .get( urlString, function( err, creq, cres, obj ) {
                            if (err) {
                                console.error( "Rest:", err, cres && cres.statusCode );
                                callback( err );
                            } else {
                                
                                // check for data
                                if (msg.query.ds && obj[ msg.query.ds ]) {
                                    obj     = obj[ msg.query.ds ];
                                    
                                    if (msg.query.table && obj[ msg.query.table ])
                                        obj     = obj[ msg.query.table ];
                                }
                                
                                callback( null, obj );
                            }
                        });
                }
            ],
            function( err, result ) {
                callback( err, result );
            }
        );
    }
};


// create json client to get response
function connect( callback ) {
    var client  = restify.createJsonClient( {
        url:        "http://" + scl.host,
        version:    "*"
    });
    callback( null, client );
}
