'use strict';

const conf      = require('../config.json'),
      Router    = require('koa-router'),
      mongo     = require('./mongo.js')( conf.db ),
      co        = require('co'),
      parse     = require('co-body'),
      log       = require('debug')('app:restHandler');

module.exports  = function() {
    var router    = new Router({
            prefix:   "/rest"
        });

    // get data from database
    router.get( "/:table", co.wrap( function *( ctx, next ) {
        log( 'get table', ctx.params );
        
        let body    = yield parse.json( ctx.req ),
            data    = yield mongo.find( {
                coll:   ctx.params.table
            } );
        ctx.body    = data;
    }));
    
    router.get( "/:table/:id", co.wrap( function *( ctx, next ) {
        console.log( "get", ctx.params.table, ',id', ctx.params.id );
        let data    = yield mongo.find( {
            coll:   ctx.params.table,
            where:  { _id: ctx.params.id }
        } );
        ctx.status  = 200;
        ctx.body    = data && data[0];
    }));

    router.post( "/:table/:id", co.wrap( function *( ctx, next ) {
        let body        = yield parse.form( ctx.req );
        
        body._id    = ctx.params.id;

        try {
            let data        = yield mongo.create( {
                    coll:       ctx.params.table,
                    where:      { _id: ctx.params.id },
                    body:       body
                } );
            ctx.body    = data;
        }
        catch(err) {
            ctx.body    = err;
            ctx.status  = 500;
        }
    }));

    return router.routes();
};
