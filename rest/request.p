ROUTINE-LEVEL ON ERROR UNDO, THROW.

USING Progress.Json.ObjectModel.*.

DEFINE VARIABLE oParse      AS ObjectModelParser  NO-UNDO.
DEFINE VARIABLE jData       AS JsonObject NO-UNDO.

DEFINE VARIABLE jResult     AS JsonObject NO-UNDO.
DEFINE VARIABLE jDataSet    AS JsonObject NO-UNDO.

DEFINE VARIABLE hDataSet    AS HANDLE  NO-UNDO.
DEFINE VARIABLE hBuffer     AS HANDLE  NO-UNDO.
DEFINE VARIABLE hDataSource AS HANDLE  NO-UNDO.
DEFINE VARIABLE hQuery      AS HANDLE  NO-UNDO.

DEFINE TEMP-TABLE ttCust NO-UNDO LIKE Customer.

{src/web/method/cgidefs.i}

LOG-MANAGER:WRITE-MESSAGE( "Request" ).

output-content-type("application/json":U).

IF NOT WEB-CONTEXT:IS-JSON THEN DO:

    LOG-MANAGER:WRITE-MESSAGE( "No JSON request" ).

    RETURN.
END.

/* read json */
oParse      = NEW ObjectModelParser().
jData       = CAST( oParse:Parse( WEB-CONTEXT:HANDLE ), JsonObject ).

DO ON ERROR UNDO, LEAVE:
    
    CREATE BUFFER hBuffer FOR TABLE "Customer".
    
    CREATE QUERY hQuery.
    hQuery:ADD-BUFFER( hBuffer ).
    hQuery:QUERY-PREPARE( "FOR EACH Customer" ).
    
    CREATE DATA-SOURCE hDataSource.
    hDataSource:ADD-SOURCE-BUFFER( hBuffer, "CustNum" ).
    hDataSource:QUERY   = hQuery.
    
    CREATE DATASET hDataSet.
    hDataSet:ADD-BUFFER( BUFFER ttCust:HANDLE ).
    hDataSet:GET-BUFFER-HANDLE(1):ATTACH-DATA-SOURCE( hDataSource ).
    
    hDataSet:FILL().
    
    jResult     = NEW JsonObject().
    jDataSet    = NEW JsonObject().

    jDataSet:READ( hDataSet ).
    jResult:Add( "data", jDataSet ).

    jResult:WriteStream( "Webstream" ).
END.

CATCH a AS Progress.Lang.Error:
   LOG-MANAGER:WRITE-MESSAGE( "Unexpected error occured: " + a:GetMessage(1) ).
END CATCH.
