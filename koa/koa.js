const conf      = require('./config.json'),
      Koa       = require('koa'),
      app       = new Koa(),
      favicon   = require('koa-favicon'),
      rest      = require('./lib/restHandler.js')(),
      co        = require('co');

app.use( favicon( __dirname + '/public/favicon.ico') );

app.use( co.wrap( function *( ctx, next ) {
    var start   = new Date;
    console.log( "a way down", ctx.req.url );
    
    yield next();
    
    console.log( 'a way back' );
    console.log( 'a Response-Time', new Date - start );
}));

app.use( ( ctx, next ) => {
    var start   = new Date;
    console.log( "b way down", ctx.req.url );
    
    return next().then( function() {
        console.log( 'b way back' );
        console.log( 'b Response-Time', new Date - start );
    });
});

app.use( auth );
app.use( rest );

app.listen( conf.port );
console.log( 'koa listening' );

// auth
function auth( ctx, next ) {

    // check for user
    if (!ctx.query.user) {
        console.log( "Not a valid user" );
        ctx.status  = 500;
        ctx.body    = "Not a valid user";
        return;
    }

    // valid user
    console.log( "Valid user" );
    return next();
}