var config      = require( "../config.json" ),
    conf        = config.jsdo;

XMLHttpRequest = require("../progress/XMLHttpRequest.js").XMLHttpRequest;
require("../progress/progress.js"); 
require("../progress/progress.session.js");

// get connection to progress and get catalog
var session = new progress.data.Session();
session.login( conf.serviceURI, "", "");
session.addCatalog( conf.catalogURI );        

module.exports	= {

    get:    function( msg, callback ) {

        // create jsdo
        var jsdo = new progress.data.JSDO( { name: 'dsCustomer' } );
    	jsdo.subscribe( 'AfterFill', onAfterFillCustomers, this);
    	jsdo.fill(); // fills the locally initialized jsdo from the catalog

        function onAfterFillCustomers( jsdo, success, request ) {
            var result      = [];
            jsdo.eCustomer.foreach( function( cust ) {
                result.push( cust.data );
            });
    
            callback( null, result );
        }
    }
};
