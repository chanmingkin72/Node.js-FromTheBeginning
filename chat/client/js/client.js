var socket      = null;

$(window).load( function() {

    // check status
    socket	= io.connect();

    socket.on( "relogin", function( data, callback ) {
        callback( $("#nickname").val() || "not yet" );
    });

    socket.on( "newMessage", function( data ) {
        console.log( "got", data );
        $("#main").prepend( "<tr><th scope='row'>" + data.name + "</th><td>" + data.msg + "</td></tr>" );
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
        $("#main").prepend( "<tr><th scope='row'>" + name + "</th><td>" + msg + "</td></tr>" );

        socket.emit( "sendMessage", msg );
        $("#message").val( "" );

    });
});