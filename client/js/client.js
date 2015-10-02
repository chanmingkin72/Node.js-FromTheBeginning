var socket      = null;

$(window).load( function() {

    // check status
    socket	= io.connect();

    socket.on( "relogin", function( data, callback ) {
        callback( $("#nickname").val() || "not yet" );
    });

    socket.on( "newMessage", function( data ) {
        console.log( "got", data );
        $("#main").append( "<div class='row-fluid'><div class='span12'><span class='label'>" + data.name + "</span>" + data.msg + "</div></div>" );
        $("#main").scrollTop( $("#main")[0].scrollHeight );
    });

    $("#connect").click( function() {
        console.log( "connect", $("#nickname").val() );
        socket.emit( "login", $("#nickname").val() );

        $("div.noshow").css( { display: "block" } );
    });

    $("#send").click( function() {

        console.log( "send", $("#message").val() );
        socket.emit( "sendMessage", $("#message").val() );
        $("#message").val( "" );

    });
});