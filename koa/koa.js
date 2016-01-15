const conf      = require('./config.json'),
      Koa       = require('koa'),
      app       = new Koa(),
      
      rest      = require('./lib/restHandler.js')(),
      co        = require('co');

app.use( rest );

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

app.use( ctx => {
    process.nextTick( function() {
        console.log( 'req' );
        ctx.body = 'Hello World';
    });
});

app.listen( conf.port );
console.log( 'koa listening' );