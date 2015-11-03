var config      = require('../config.json'),
    mongoose    = require('mongoose');

mongoose.connect( 'mongodb://' + config.db.host + ':27017/' + config.db.name )

var model   = {
        // **** ToDo
        todo:    mongoose.model( "todo", new mongoose.Schema({
            title:          String,
            description:    String,
            status:         Number
        }))
    };

module.exports  = {
    get:    function( elm, callback ) {
        model[ elm.table ].find( function( err, data ) {
            console.log( "get", elm.table, err, model.todo, data );
            callback( err, data );
        });
    }
};