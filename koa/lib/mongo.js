'use strict';

const conf      = require('../config.json'),
      mongoCli  = require('mongodb'),
      co        = require('co'),
      log       = require('debug')('app:mongo');

let db;

module.exports	= function( conf ) {
    var data    = new Data( conf );
    return data;
};

function Data( conf ) {
    this.conf   = conf;
    return this;
}

Data.prototype.find     = function *( elm ) {
    log( 'find', elm, this.conf );
    let db      = yield connect( this.conf );
    let data    = yield find( db, elm );
    return data;
};

Data.prototype.create     = function *( elm ) {
    log( 'create', elm, this.conf );
    
    try {
        let db      = yield connect( this.conf );
        let data    = yield insert( db, elm );
    }
    catch(err) {
        throw new Error(err);
    }
    return data;
};

// Data.prototype.findOne  = function *( elm ) {
//     log( 'findOne', elm );
//     let db      = yield connect();
//     let data    = yield findOne( db, elm );
//     return data;
// };

// connect to mongo
function connect (conf) {
    return new Promise( function( resolve, reject ) {
        let mongoUrl    = 'mongodb://' + conf.host + ':' + conf.port + '/' + conf.name;

        if (db)
            return resolve( db );

        mongoCli.connect( mongoUrl, function( err, db ) {
            if (err)
                reject( err );
            else
                resolve( db );
        } );
    });
}

// find data
function find( db, elm ) {
    return new Promise( function( resolve, reject ) {
        
        // get collection
        let coll    = db.collection( elm.coll );
        
        // find 
        coll
            .find( elm.where )
            .toArray( function( err, data ) {
                if (err)
                    reject( err );
                else
                    resolve( data );
            });
    });
}

// create data
function insert( db, elm ) {
    return new Promise( function( resolve, reject ) {
        
        // get collection
        let coll    = db.collection( elm.coll );
        
        // find 
        coll
            .insert( elm.body, function( err, data ) {
                if (err)
                    reject( err );
                else
                    resolve( data );
            });
    });
}