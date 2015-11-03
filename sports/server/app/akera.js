var config      = require( "../config.json" ),
    akera       = require( 'akera-api'),
    async       = require('async'),
    confAk      = config.akera;

module.exports	= {

    get:    function( msg, callback ) {

        async.waterfall(
            [
                // connect to rest service
                function( callback ) {
                    connect( callback );
                },
    
                // call service
                function( conn, callback ) {

                    conn
                        .query
                        .select( msg.params.table )
                        .fields()
                        .all()
                        .then(
                            function( rows ) {
                                callback( null, rows );
                            },
                            function( err ) {
                                callback( err );
                            }
                        )
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

    akera
        .connect( confAk.host, confAk.port )
        .then( 
            function(conn) {
                callback( null, conn );
            },
            function( err ) {
                callback( err );
            }
        );
}
