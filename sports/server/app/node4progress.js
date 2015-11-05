var config      = require( "../config.json" ),
    n4p         = require( 'node4progress')( config.node4progress );

module.exports	= {

    get:    function( msg, callback ) {

        n4p.setAppsvrProc( "CustomerHandler.p", "", false, true );

        n4p.setParameter( "InputPars", "longchar", "input", "NumCustomersToPull=10&batchNum=1", "" );
        n4p.setParameter( "OutputPars", "character", "output", "", "" );
        n4p.setParameter( "dsCustomer", "dataset-handle", "output", "", "" );
        n4p.setParameter( "ErrMsg", "character", "output", "", "" );

        n4p.appProc().execute( function( err, result ) {
            console.log( "n4p", err, result );
            callback( err, result );
        });
    }
};
