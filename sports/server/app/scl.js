"use strict";

const config      = require( "../config.json" ),
      restify     = require( 'restify' ),
      url         = require('url'),
      scl         = config.scl,
      
      log         = require('debug')('app:scl');

module.exports	= {

    get:    function*( msg ) {
        
        try {

            // connect to webspeed
            let client  = yield connect();
            
            // call service
            let data    = yield sclPost( client, msg );
            
            return data;
        } 
        catch(e) {
            console.log( "Error", e );
            throw Error(e);
        }
    }
};


// create json client to get response
function connect() {
    return new Promise( function( resolve, reject ) {
        let client  = restify.createJsonClient( {
                url:        "http://" + scl.host,
                version:    "*"
            });
        resolve( client );
    });
}

// post data
function sclPost( client, msg ) {
    return new Promise( function( resolve, reject ) {
        let urlString   = scl.url + url.format( { query: { filter: JSON.stringify({ top: 10, skip: 0 }) } } );

        client
            .get( urlString, function( err, creq, cres, obj ) {
                if (err) {
                    console.error( "Rest:", err, cres && cres.statusCode );
                    return reject( err );
                } else {
                    
                    // check for data
                    if (msg.query.ds && obj[ msg.query.ds ]) {
                        obj     = obj[ msg.query.ds ];
                        
                        if (msg.query.table && obj[ msg.query.table ])
                            obj     = obj[ msg.query.table ];
                    }
                    
                    resolve( obj );
                }
            });
   });
}