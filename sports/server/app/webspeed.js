var config      = require( "../config.json" ),
    restify     = require( 'restify' ),
    async       = require( 'async' ),
    ws          = config.webspeed;

module.exports	= {

    get:    function( msg, callback ) {
        var param   = msg.body || {};

        async.waterfall(
            [
                // connect to rest service
                function( callback ) {
                    connect( callback );
                },
    
                // call service
                function( client, callback ) {
                    client
                        .post( ws.url, param, function( err, creq, cres, obj ) {
                            if (err) {
                                console.error( "Rest:", err, cres && cres.statusCode );
                                return callback( err );
                            }
                                
                            // check for data
                            if (obj.data && obj.data.ProDataSet)
                                obj     = obj.data.ProDataSet;
                            
                            callback( null, obj );
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
        url:        "http://" + ws.host,
        version:    "*"
    });
    callback( null, client );
}
