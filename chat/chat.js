var config      = require('./config.json'),

    express     = require('express'),
    app         = express(),

    numConn     = 0;

app.use( express.static( './client' ) );
app.use( express.static( '../static' ) );

app.listen( config.port );