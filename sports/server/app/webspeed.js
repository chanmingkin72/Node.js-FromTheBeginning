"use strict";

const config      = require( "../config.json" ),
      ws          = config.webspeed,
      restify     = require( 'restify' ),

      log         = require('debug')('app:webspeed');

module.exports	= {

    get:    function*( msg ) {

        try {

            // connect to webspeed
            let client  = yield connect();
            
            // call service
            let data    = yield wsPost( client, msg.body || {} );
            
            log( data );
            
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
                url:        "http://" + ws.host,
                version:    "*"
            });
        resolve( client );
    });
}

// post data
function wsPost( client, param ) {
    return new Promise( function( resolve, reject ) {
        client
            .post( ws.url, param, function( err, creq, cres, obj ) {
                log( ws.host, ws.url, param, err, obj );
                if (err) {
                    console.error( "Rest:", err, cres && cres.statusCode );
                    return reject( err );
                }
                    
                // check for data
                if (obj.data && obj.data.ProDataSet)
                    obj     = obj.data.ProDataSet;
                
                resolve( obj );
            });
    });
}