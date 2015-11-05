var socket      = null;

$(window).load( function() {

    // check status
    socket	= io.connect();

    socket.on( "relogin", function( data, callback ) {
        callback( $("#nickname").val() || "not yet" );
    });

    socket.on( "newMessage", function( data ) {
        console.log( "got", data );
        $("#main").prepend( "<div class='row'><div class='col-xs-3 col-sm-2 col-md-1'><b>" + data.name + "</b></div><div class='col-xs-9 col-sm-10 col-md-11'>" + data.msg + "</div></div>" );
    });

    $("#connect").click( function() {
        console.log( "connect", $("#nickname").val() );
        socket.emit( "login", $("#nickname").val() );

        $("div.noshow").css( { display: "block" } );
    });

    $("#send").click( function() {
        var msg     = $("#message").val(),
            name    = $("#nickname").val();
            
        console.log( "send", name, msg );
        $("#main").prepend( "<div class='row'><div class='col-xs-3 col-sm-2 col-md-1'><b>" + name + "</b></div><div class='col-xs-9 col-sm-10 col-md-11'>" + msg + "</div></div>" );

        socket.emit( "sendMessage", msg );
        $("#message").val( "" );

    });
});