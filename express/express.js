var config      = require('./config.json'),
    express     = require('express'),
    app         = express();

app.listen( config.port );
