/*------------------------------------------------------------------------
   Class:   zlib-prototype.p
   
   Function prototypes for zlib library written by Jean-loup Gailly - 
   <http://www.zlib.net/>
   
   If the zlib library is not already available on the system default libraries path 
   you can set the full path to the downloaded library by using <ZLIB_LIB> preprocessor.
   
   Copyright notice:

   Copyright (C) 2014 Marian Edu <marian.edu@ganimede.ro>
   
   Released as open source courtesy of XPower <http://www.xpower.be>

   License:

  This software is provided *'as-is'*, without any express or implied
  warranty.  In no event will the authors be held liable for any damages
  arising from the use of this software.

  Permission is granted to anyone to use this software for any purpose,
  including commercial applications, and to alter it and redistribute it
  freely, subject to the following restrictions:

  1. The origin of this software must not be misrepresented; you must not
     claim that you wrote the original software. If you use this software
     in a product, an acknowledgment in the product documentation would be
     appreciated but is not required.

  2. Altered source versions must be plainly marked as such, and must not be
     misrepresented as being the original software.

  3. This notice may not be removed or altered from any source distribution.

 ----------------------------------------------------------------------*/

/* ***************************  Definitions  ************************** */

routine-level on error undo, throw.

/*
    Preprocessor: ZLIB_LIB
    The full path to the Zlib shared library (.dll for Windows, .so for *nix) .
*/
    
&scoped-define ZLIB_LIB 

&if defined(ZLIB_LIB) = 0 or '{&ZLIB_LIB}' = '' &then

&if opsys = 'win32' &then
    &scoped-define ZLIB_LIB 'zlib1.dll':u
&else
    &scoped-define ZLIB_LIB 'libz.so.1':u
&endif

&endif /* not defined */



/* ***************************  Main Block  *************************** */

/*
    Procedure: compress

    Compresses the data from input buffer into destination memory buffer 
    that will hold the compressed data.
    
    Parameters:
        - output buffer for compressed data.
        - size of output buffer, will be updated on call
        - input buffer with uncompressed data
        - size of input buffer
        
    Returns: 
        return code, 0 if OK
               
    */
procedure compress      external {&ZLIB_LIB} cdecl persistent:
    define input  parameter mbOut       as memptr      no-undo. 
    define input  parameter lenOut      as long        no-undo. 
    define input  parameter mbIn        as memptr      no-undo. 
    define input  parameter lenIn       as long        no-undo. 
    define return parameter retCode     as long        no-undo. 
end procedure.

/*
    Procedure: uncompress

    Uncompresses the data from input buffer into destination memory buffer 
    that will hold the uncompressed data.
    
    Parameters:
        - output buffer for uncompressed data.
        - size of output buffer, will be updated on call
        - input buffer with compressed data
        - size of input buffer
        
    Returns: 
        return code, 0 if OK
               
    */
procedure uncompress      external {&ZLIB_LIB} cdecl persistent:
    define input  parameter mbOut       as memptr      no-undo. 
    define input  parameter lenOut      as long        no-undo. 
    define input  parameter mbIn        as memptr      no-undo. 
    define input  parameter lenIn       as long        no-undo. 
    define return parameter retCode     as long        no-undo. 
end procedure.


/*
    Procedure: compressBound

    Return the minimum buffer allocation size for holding compressed data for 
    given input buffer size.
    
    Parameters:
        Input uncompressed data length
        
    Returns: 
        minimum buffer allocation for compress buffer
               
    */
procedure compressBound external {&ZLIB_LIB} cdecl persistent:
    define input  parameter lenIn       as long        no-undo. 
    define return parameter lenOut      as long        no-undo. 
end procedure.

/*
    Procedure: gzopen

    Open gzip file for read/write.
    
    Parameters:
        - file pathname, must exists for read/append
        - open mode: read (r), write (w), append (a)
        
    Returns: 
        gzip file pointer, 0 if error
               
    */
procedure gzopen        external {&ZLIB_LIB} cdecl persistent:
    define input  parameter filePath    as character   no-undo. 
    define input  parameter openMode    as character   no-undo. 
    define return parameter gzipFile    as long        no-undo. 
end procedure. 

/*
    Procedure: gzclose

    Close the gzip file pointer.
    
    Parameters:
        gzip file pointer
        
    Returns: 
         0 if OK, else error code
               
    */
procedure gzclose       external {&ZLIB_LIB} cdecl persistent:
    define input  parameter gzipFile    as long        no-undo. 
    define return parameter retCode     as long        no-undo.
end procedure. 

/*
    Procedure: gzread

    Read from gzip file in a allocated memory buffer.
    
    Parameters:
        - gzip file pointer
        - output buffer for uncompressed data
        - size of output buffer
        
    Returns: 
        number of bytes read, less than buffer size if eof, -1 if error
               
    */
procedure gzread        external {&ZLIB_LIB} cdecl persistent:
    define input  parameter gzipFile    as long        no-undo. 
    define input  parameter readBuffer  as long        no-undo. 
    define input  parameter bufferLen   as long        no-undo. 
    define return parameter bytesRead   as long        no-undo.  
end procedure.

/*
    Procedure: gzputs

    Write uncompressed string to a gzip file; need to be open with 'w' or 'a.
    
    Parameters:
        - gzip file pointer
        - uncompressed data to write
        
    Returns: 
        number of characters written, -1 on error
               
    */
procedure gzputs        external {&ZLIB_LIB} cdecl persistent:
    define input  parameter gzipFile    as long        no-undo.
    define input  parameter strContent  as character   no-undo.
    define return parameter retCode     as long        no-undo.
end procedure. 

/*
    Procedure: gzwrite

    Write uncompressed data from a memory buffer to a gzip file.
    
    Parameters:
        - gzip file pointer
        - uncompressed data buffer
        - uncompressed buffer length
        
    Returns: 
        written compressed data length, 0 if error
               
    */
procedure gzwrite       external {&ZLIB_LIB} cdecl persistent:
    define input  parameter gzipFile    as long        no-undo.
    define input  parameter mbIn        as memptr      no-undo.
    define input  parameter lenIn       as long        no-undo.
    define return parameter lenOut      as long        no-undo.
end procedure.

