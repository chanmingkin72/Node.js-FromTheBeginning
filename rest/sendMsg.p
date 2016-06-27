ROUTINE-LEVEL ON ERROR UNDO, THROW.

USING co.dsg.http.*.

DEFINE VARIABLE objHttp             AS CLASS http         NO-UNDO.
DEFINE VARIABLE objHttpRequest      AS CLASS httpRequest  NO-UNDO.
DEFINE VARIABLE objHttpResponce     AS CLASS httpResponce NO-UNDO.

DO ON ERROR UNDO, LEAVE:

    objHttp        = NEW http().
    objHttpRequest = NEW httpRequest().

    objHttpRequest:HttpMethod = 'GET'.

    objHttpRequest:path = '/oecall?text=Hello%20World&title=PUG'.

    objHttpResponce = objHttp:SynchronousRequest( 'http://sports.demo.node4biz.com', objHttpRequest ). 

END.

CATCH err AS Progress.Lang.Error:
    MESSAGE 
        "Unexpected error occured: " err
        VIEW-AS ALERT-BOX.
END CATCH.
