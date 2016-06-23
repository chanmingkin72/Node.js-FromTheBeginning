"use strict";

const config      = require( "../config.json" ),
      akera       = require( 'akera-api'),
      confAk      = config.akera,
    
      log         = require('debug')('app:akera');
 
module.exports	= {

    get:    function*( msg ) {

        try {

            // connect to akera
            let conn    = yield akera.connect( confAk.host, confAk.port );
            
            // call service
            let data    = yield conn
                            .query
                            .select( msg.params.table )
                            .fields()
                            .all();

            return data;
        } 
        catch(e) {
            console.log( "Error", e );
            throw Error(e);
        }

    }
};
