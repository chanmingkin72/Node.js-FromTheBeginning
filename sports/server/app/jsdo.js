const config      = require( "../config.json" ),
      conf        = config.jsdo,
      
      co          = require('co'),
      
      log         = require('debug')('app:jsdo');

// initialize jsdo
XMLHttpRequest = require("../progress/XMLHttpRequest.js").XMLHttpRequest;
require("../progress/progress.util.js"); 
require("../progress/progress.js"); 
require("../progress/progress.session.js");

// get connection to progress and get catalog
var session = new progress.data.Session();
session.login( conf.serviceURI, "", "" );
session.addCatalog( conf.catalogURI );        

module.exports	= {

    get:    function*( msg ) {

        // create jsdo
        let jsdo = new progress.data.JSDO( { name: 'dsCustomer' } );

        let result  = yield afterFill( jsdo );
        
        return result;
    }
};

function afterFill( jsdo ) {
    return new Promise( function( resolve, reject ) {

        // subscribe to event
    	jsdo.subscribe( 'AfterFill', onAfterFillCustomers, this );
    	
    	jsdo.fill(); // fills the locally initialized jsdo from the catalog

        // we have to copy the data, to get rid of internal functions
        function onAfterFillCustomers( jsdo, success, request ) {
            var result      = [];
            jsdo.eCustomer.foreach( function( cust ) {
                result.push( cust.data );
            });
    
            resolve( result );
        }
    });
}
