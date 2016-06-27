 /*------------------------------------------------------------------------
   Class:   Zlib
   
   Gzip encoding based on zlib library written by Jean-loup Gailly - 
   <http://www.zlib.net/>
   
   
   Depending on the target OS please select the right shared or dynamic
   library from <http://www.zlib.net/>. 
   
   If the zlib library is not already available on the system you might need to
   set the full path to the downloaded library in <zlib-prototype.p>.
   
   Examples:
       
   (start code)

    // compress a file, overwrite the output file if exists
    Zlib:getInstance(1000):compressFile('input.txt', 'output.zip', true).

    // compress string (character or longchar), raise error if the output file exists 
    Zlib:getInstance():compress('uncompressed text', 'text.zip').

``  // uncompress a file, overwrite the output file if exists
    Zlib:getInstance(10000):uncompressFile('input.zip', 'logo.png', true).

   (end)
   
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
 
 /*------------------------------------------------------------------------
    File        : Zlib
    Purpose     : 
    Syntax      : 
    Description : Gzip encoding based on zlib library written by Jean-loup 
                  Gailly - http://www.zlib.net/
    Author(s)   : m.edu <marian.edu@ganimede.ro>
    Created     : Thu Mar 27 10:10:22 CET 2014
    Notes       : 
  ----------------------------------------------------------------------*/

using net.progress.encode.gzip.Zlib.
using Progress.Lang.*.

routine-level on error undo, throw.

class net.progress.encode.gzip.Zlib: 
    
    define private static variable  zlibInstance    as Zlib     no-undo.
    
    /*
    Property: workBufferSize
    The default working buffer size.
    
    Used by default for in-memory <uncompress> if destination buffer size is not
    specified and for file compression/uncompression to process file data in chunks.
    
    Setting this to a lower values will have an important effect on compression/uncompression
    performance, to high values will lead to a greater memory usage during operations.
    
    Default value is 100k bytes.
    */
    
    define public  property         workBufferSize  as int64    no-undo initial 102400
        get. set.
              
    define private property         hZlib           as handle   no-undo
        get:
            if not valid-handle(hZlib) then
                run net/progress/encode/gzip/zlib-prototype.p persistent set hZlib.
            
            return hZlib.
        end get.
        set.
        
    
    constructor private Zlib():
    end constructor.
    
    /*
    Method: getInstance

    Static method used to obtain a Zlib compression instance.
    
    Returns: 
        A instance of Zlib compression object (singleton).
               
    */
    method static public Zlib getInstance ():
        return getInstance(?).
    end method.
    
    /*
    Method: getInstance

    Static method used to obtain a Zlib compression instance, it
    will also set the default working buffer size on it.
    
    Parameters:
        The work buffer size of Zlib compression instance.
        
    Returns: 
        A instance of Zlib compression object (singleton).
               
    */
    method static public Zlib getInstance (workBufferSize as int64):
        if not valid-object(zlibInstance) then
            zlibInstance = new Zlib().
        
        if workBufferSize > 0 then
            zlibInstance:workBufferSize = workBufferSize.
                
        return zlibInstance.
    end method.
    
    /*
    Method: compress

    Compresses the data from input string and returns a memory buffer holding
    compressed data.
    
    The memory location of returning buffer need to be freed by the caller.
    
    Parameters:
        The input string (longchar or character) holding the data to be compressed.
        
    Returns: 
        A new memory buffer holding the compressed data.
               
    See also:
        
        <compressFile>, <uncompress>, <uncompressFile> 
    */
    method public memptr compress (strData as longchar):
        define variable mpBuffer    as memptr no-undo.
        
        if strData = ? or length(strData, 'raw':u) eq 0 then
            undo, throw new AppError('Empty content', 0).
            
        copy-lob from strData to mpBuffer no-convert.
        
        return this-object:compress(mpBuffer).
        
        finally:
            set-size(mpBuffer) = 0 no-error.
        end finally.    
    end method.

    /*
    Method: compress

    Compresses the data from input memory buffer and returns a new buffer holding
    compressed data.
    
    The memory location of returning buffer need to be freed by the caller.
    
    Parameters:
        The input memory buffer holding the data to be compressed.
        
    Returns: 
        A new memory buffer holding the compressed data.
               
    See also:
        
        <compressFile>, <uncompress>, <uncompressFile> 
    */
    method public memptr compress (dataBuffer as memptr):
        define variable mpBuffer    as memptr       no-undo.
        define variable mpLength    as memptr       no-undo.
        define variable mpOutput    as memptr       no-undo.
        define variable szInput     as int64        no-undo.
        define variable szBuffer    as int64        no-undo.
        define variable retCode     as integer      no-undo.
        
        szInput = get-size(dataBuffer).
        
        if szInput = ? or szInput = 0 then
            undo, throw new AppError('Empty content', 0).
            
        run compressBound in hZlib (szInput, output szBuffer).
        
        assign 
            set-size(mpBuffer)      = szBuffer
            set-size(mpLength)      = 4
            put-long(mpLength, 1)   = szBuffer.
        
        run compress in hZlib (mpBuffer, get-pointer-value(mpLength), dataBuffer, szInput, output retCode).
        
        if retCode ne 0 then
            undo, throw new AppError ('Error on data compression', 0).
        
        assign 
            szBuffer = get-long(mpLength, 1)
            mpOutput = get-bytes(mpBuffer, 1, szBuffer).
        
        return mpOutput.
            
        finally:
            set-size(mpLength) = 0 no-error.
            set-size(mpBuffer) = 0 no-error.
        end finally.
    end method.
    
    /*
    Method: compress

    Compresses the data from input memory buffer and save the compressed data in a file
    using the gzip file format. 
    
    If the output file exists this method will throw an error.
    
    Parameters:
        - The input memory buffer holding the data to be compressed.
        - The path of output compressed gzip file.
        
    Returns: 
        The size of compressed data written in gzip file, only the payload excluding
        gzip format additional information.
               
    See also:
        
        <compressFile>, <uncompress>, <uncompressFile> 
    */
    method public int64 compress (dataBuffer as memptr, gzipPath as character):
        this-object:compress(dataBuffer, gzipPath, false).
    end method.
    
    /*
    Method: compress

    Compresses the data from input memory buffer and save the compressed data in a file
    using the gzip file format. 
    
    If forceOverwrite flag is set to false and the output file exists this method will 
    throw an error, if set to true the file will be overwriten.
    
    Parameters:
        - The input memory buffer holding the data to be compressed.
        - The path of output compressed gzip file.
        - Force overwrite of output compressed gzip file.
        
    Returns: 
        The size of compressed data written in gzip file, only the payload excluding
        gzip format additional information.
               
    See also:
        
        <compressFile>, <uncompress>, <uncompressFile> 
    */
    method public int64 compress (dataBuffer as memptr, gzipPath as character, 
        forceOverwrite as logical):
        
        define variable gzFile      as int64        no-undo.
        define variable szOutput    as int64        no-undo.
        define variable szInput     as int64        no-undo.
        
        szInput = get-size(dataBuffer).
        
        if szInput = ? or szInput = 0 then
            undo, throw new AppError('Empty content', 0).
        
        assign 
            gzFile      = this-object:openFile(gzipPath, true, forceOverwrite)
            szOutput    = this-object:writeFile(gzFile, dataBuffer).
            
        return szOutput.
            
        finally:
            this-object:closeFile(gzFile).
            /* no output, clean-up the file if created */
            if szOutput = 0 then
                os-delete value(gzipPath).
        end finally.
    end method.
    
    /*
    Method: compress

    Compresses the data from input string and save the compressed data in a file
    using the gzip file format. 
    
    If the output file exists this method will throw an error.
    
    Parameters:
        - The input string (longchar or character) holding the data to be compressed.
        - The path of output compressed gzip file.
        
    Returns: 
        The size of compressed data written in gzip file, only the payload excluding
        gzip format additional information.
               
    See also:
        
        <compressFile>, <uncompress>, <uncompressFile> 
    */
    method public int64 compress (strData as longchar, gzipPath as character):
        this-object:compress(strData, gzipPath, false).
    end method.
    
    /*
    Method: compress

    Compresses the data from input string and save the compressed data in a file
    using the gzip file format. 
    
    If forceOverwrite flag is set to false and the output file exists this method 
    will throw an error, if set to true the file will be overwriten.
    
    Parameters:
        - The input string (longchar or character) holding the data to be compressed.
        - The path of output compressed gzip file.
        - Force overwrite of output compressed gzip file.
        
    Returns: 
        The size of compressed data written in gzip file, only the payload excluding
        gzip format additional information.
               
    See also:
        
        <compressFile>, <uncompress>, <uncompressFile> 
    */
    method public int64 compress (strData as longchar, gzipPath as character, 
        forceOverwrite as logical):
        
        define variable gzFile      as int64        no-undo.
        define variable szOutput    as int64        no-undo.
        
        if strData = ? or length(strData, 'raw':u) eq 0 then
            undo, throw new AppError('Empty content', 0).
        
        assign 
            gzFile      = this-object:openFile(gzipPath, true, forceOverwrite)
            szOutput    = this-object:writeFile(gzFile, strData).
        
        return szOutput.
            
        finally:
            this-object:closeFile(gzFile).
            /* no output, clean-up the file if created */
            if szOutput = 0 then
                os-delete value(gzipPath).
        end finally.
    end method.
    
    /*
    Method: compressFile

    Compresses the data from the input file and save the compressed data in a file
    using the gzip file format. 
    
    If the output file exists this method will throw an error.
    
    Parameters:
        - The input file containing the data to be compressed.
        - The path of output compressed gzip file.
        
    Returns: 
        The size of compressed data written in gzip file, only the payload excluding
        gzip format additional information.
               
    See also:
        
        <compressFile>, <uncompress>, <uncompressFile> 
    */
    method public int64 compressFile (filePath as character, gzipPath as character):
        this-object:compressFile(filePath, gzipPath, false).
    end method.
    
    /*
    Method: compressFile

    Compresses the data from the input file and save the compressed data in a file
    using the gzip file format. 
    
    If forceOverwrite flag is set to false and the output file exists this method 
    will throw an error, if set to true the file will be overwriten.
    
    Parameters:
        - The input file containing the data to be compressed.
        - The path of output compressed gzip file.
        - Force overwrite of output compressed gzip file.
        
    Returns: 
        The size of compressed data written in gzip file, only the payload excluding
        gzip format additional information.
               
    See also:
        
        <compress>, <uncompress>, <uncompressFile> 
    */    
    method public int64 compressFile (filePath as character, gzipPath as character,
        forceOverwrite as logical):
            
        define variable mpInput     as memptr       no-undo.
        define variable gzFile      as int64        no-undo.
        define variable szInput     as int64        no-undo.
        define variable szOffset    as int64        no-undo.
        define variable szOutput    as int64        no-undo.
        
        assign file-info:file-name = search(filePath).
        
        if file-info:file-type = ? then
            undo, throw new AppError('File not found', 0).
            
        if index(file-info:file-type, 'F':u) eq 0 then
            undo, throw new AppError('Not a file', 0).
        
        if index(file-info:file-type, 'R':u) eq 0 then
            undo, throw new AppError('File not readable', 0).
        
        assign
            szInput = file-info:file-size  
            gzFile  = this-object:openFile(gzipPath, true, forceOverwrite).
        
        do while szOffset < szInput:
            copy-lob from file file-info:full-pathname 
                starting at szOffset + 1 for minimum(workBufferSize, szInput - szOffset)
                to mpInput.
            
            szOutput = szOutput + this-object:writeFile(gzFile, mpInput).
            
            assign 
                szOffset = szOffset + workBufferSize    
                set-size(mpInput) = 0.
        end. 
        
        return szOutput.
        
        finally:
            set-size(mpInput) = 0 no-error.
            this-object:closeFile(gzFile).
            
            /* no output, clean-up the file if created */
            if szOutput = 0 then
                os-delete value(gzipPath).
        end finally.
    end method.
    
    /*
    Method: uncompress

    Uncompresses the data from input memory buffer and return the
    uncompressed data in a new memory buffer. 
    
    The default <workBufferSize> is set as the maximum size of 
    uncompressed memory buffer.
    
    If the destination maximum memory size is not large enough the method 
    will raise an error.
    
    Parameters:
        The input memory buffer holding the compressed data.
        
    Returns: 
        The new memory buffer holding uncompressed data, the caller is
        responsible of freeing it afterwards.
               
    See also:
        
        <compressFile>, <compress>, <uncompressFile> 
    */
    method public memptr uncompress (dataBuffer as memptr):
        return this-object:uncompress(dataBuffer, workBufferSize).
    end method.
    
    /*
    Method: uncompress

    Uncompresses the data from input memory buffer and return the
    uncompressed data in a new memory buffer. 
        
    If the destination maximum memory size is not large enough the method 
    will raise an error.
    
    Parameters:
        - The input memory buffer holding the compressed data.
        - The maximum size of uncompressed memory buffer.
        
    Returns: 
        The new memory buffer holding uncompressed data, the caller is
        responsible of freeing it afterwards. 
               
    See also:
        
        <compressFile>, <compress>, <uncompressFile> 
    */    
    method public memptr uncompress (dataBuffer as memptr, bufferSize as int64):
        define variable mpBuffer    as memptr       no-undo.
        define variable mpLength    as memptr       no-undo.
        define variable mpOutput    as memptr       no-undo.
        define variable szInput     as int64        no-undo.
        define variable szBuffer    as int64        no-undo.
        define variable retCode     as integer      no-undo.
        
        szInput = get-size(dataBuffer).
        
        if szInput = ? or szInput = 0 then
            undo, throw new AppError('Empty content', 0).
            
        assign 
            set-size(mpBuffer)      = bufferSize
            set-size(mpLength)      = 4
            put-long(mpLength, 1)   = bufferSize.
        
        run uncompress in hZlib (mpBuffer, get-pointer-value(mpLength), dataBuffer, szInput, output retCode).
        
        if retCode ne 0 then
            undo, throw new AppError ('Error on data uncompression', 0).
        
        assign 
            szBuffer = get-long(mpLength, 1)
            mpOutput = get-bytes(mpBuffer, 1, szBuffer).
        
        return mpOutput.
            
        finally:
            set-size(mpLength) = 0 no-error.
            set-size(mpBuffer) = 0 no-error.
        end finally.
    end method.
    
    /*
    Method: uncompress

    Uncompresses the data from input memory buffer and save the uncompressed data in a file. 
    If the output file exists this method will throw an error.
    
    Parameters:
        - The input memory buffer holding the compressed data.
        - The path of output file to uncompress into.
        
    Returns: 
        The size of uncompressed data written to output file.
               
    See also:
        
        <compressFile>, <compress>, <uncompressFile> 
    */
    method public int64 uncompress (dataBuffer as memptr, filePath as character):
        return this-object:uncompress(dataBuffer, filePath, false).
    end method.
        
    /*
    Method: uncompress

    Uncompresses the data from input memory buffer and save the uncompressed data in a file. 
    If the output file exists this method will throw an error.
    
    Parameters:
        - The input memory buffer holding the compressed data.
        - The path of output file to uncompress into.
        - Force overwrite of output file.
        
    Returns: 
        The size of uncompressed data written to output file.
               
    See also:
        
        <compressFile>, <compress>, <uncompressFile> 
    */
    method public int64 uncompress (dataBuffer as memptr, filePath as character,
        forceOverwrite as logical):
        define variable mpBuffer    as memptr       no-undo.
        define variable mpOutput    as memptr       no-undo.
        define variable gzFile      as int64        no-undo.
        define variable szRead      as int64        no-undo.
        define variable szOutput    as int64        no-undo.
        define variable szInput     as int64        no-undo.
        define variable szBuffer    as int64        no-undo.
        
        szInput = get-size(dataBuffer).
        
        if szInput = ? or szInput = 0 then
            undo, throw new AppError('Empty content', 0).
            
        file-info:file-name = filePath.
        
        if file-info:file-type ne ? and not forceOverwrite then
            undo, throw new AppError('File already exist', 0).
        
        szBuffer = workBufferSize / 100.
        
        do while szRead < szInput:
            assign 
                szBuffer = minimum(szBuffer, szInput - szRead) 
                mpBuffer = get-bytes(dataBuffer, szRead + 1, szBuffer)
                mpOutput = this-object:uncompress(mpBuffer).
                   
            if szOutput = 0 then 
                copy-lob from mpOutput to file filePath.
            else
                copy-lob from mpOutput to file filePath append.
            
            assign szRead   = szRead + szInput
                   szOutput = szOutput + get-size(mpOutput). 
            
            set-size(mpBuffer) = 0.
            set-size(mpOutput) = 0.   
        end.
        
        return szOutput.
        
        finally:
            set-size(mpBuffer) = 0.
            set-size(mpOutput) = 0.
        end finally.
    end method.
    
    /*
    Method: uncompressFile

    Uncompresses the data from input gzip compressed file and save the uncompressed data in a file. 
    If the output file exists this method will throw an error.
    
    Parameters:
        - The path of gzip file containing the compressed data.
        - The path of output file to uncompress into.
        
    Returns: 
        The size of uncompressed data written to output file.
               
    See also:
        
        <compressFile>, <compress>, <uncompress> 
    */
    method public int64 uncompressFile (gzipPath as character, filePath as character):
        this-object:uncompressFile(gzipPath, filePath, false).
    end method.
    
    /*
    Method: uncompressFile

    Uncompresses the data from input gzip compressed file and save the uncompressed data in a file. 
    If forceOverwrite flag is set to false and the output file exists this method will throw an error, 
    if set to true the file will be overwriten.
    
    Parameters:
        - The path of gzip file containing the compressed data.
        - The path of output file to uncompress into.
        - Force overwrite of output file.
        
    Returns: 
        The size of uncompressed data written to output file.
               
    See also:
        
        <compressFile>, <compress>, <uncompress> 
    */    
    method public int64 uncompressFile (gzipPath as character, filePath as character,
        forceOverwrite as logical):
            
        define variable mpBuffer    as memptr       no-undo.
        define variable gzFile      as int64        no-undo.
        define variable szRead      as int64        no-undo.
        define variable szOutput    as int64        no-undo.
        
        file-info:file-name = filePath.
        
        if file-info:file-type ne ? and not forceOverwrite then
            undo, throw new AppError('File already exist', 0).
            
        file-info:file-name = search(gzipPath).
        
        if file-info:file-type = ? then
            undo, throw new AppError('File not found', 0).
            
        if index(file-info:file-type, 'F':u) eq 0 then
            undo, throw new AppError('Not a file', 0).
        
        if index(file-info:file-type, 'R':u) eq 0 then
            undo, throw new AppError('File not readable', 0).
        
        gzFile  = this-object:openFile(file-info:full-pathname, false, false).
        
        repeat on error undo, throw:
            assign 
                mpBuffer = this-object:readFile(gzFile, workBufferSize)
                szRead   = get-size(mpBuffer).
            
            if szRead > 0 then do:
                if szOutput = 0 then 
                    copy-lob from mpBuffer to file filePath.
                else
                    copy-lob from mpBuffer to file filePath append.
            end.
            
            szOutput = szOutput + szRead.
            
            if szRead < workBufferSize then
                leave.
            
            set-size(mpBuffer) = 0.
        end. 
        
        return szOutput.
        
        finally:
            set-size(mpBuffer) = 0 no-error.
            this-object:closeFile(gzFile).
            
            /* no output, clean-up the file if created */
            if szOutput = 0 then
                os-delete value(filePath).
        end finally.
    end method.
    
    method private int64 openFile (filePath as character, forWrite as logical, forceOverwrite as logical):
        define variable gzFile      as int64    no-undo.
        
        if search(filePath) ne ? then do:
            if forWrite and not forceOverwrite then 
                undo, throw new AppError ('File already exists', 0).
            else 
                filePath = search(filePath).
        end.
        
        run gzopen in hZlib (filePath, string(forWrite, 'w/r':u), output gzFile).
        
        if gzFile = 0 then
            undo, throw new AppError ('Error opening file', 0).
            
        return gzFile.
        
    end method.
        
    method private logical closeFile (gzFile as int64):
        define variable retCode     as integer  no-undo.
        
        run gzclose in hZlib (gzFile, output retCode).  
        
        return retCode = 0.
        
        catch e as Progress.Lang.Error :
                delete object e.
                return false.        
        end catch.
    end method.
    
    method private int64 writeFile (gzFile as int64, mpData as memptr):
        define variable bytesWrite      as int64  no-undo.
        
        if get-size(mpData) = 0 then
            return 0.
            
        run gzwrite in hZlib (gzFile, mpData, get-size(mpData), output bytesWrite).  
        
        if bytesWrite = 0 then
            undo, throw new AppError('Write data error', 0).
            
        return bytesWrite.
        
    end method.
    
    method private int64 writeFile (gzFile as int64, strData as longchar):
        define variable bytesWrite      as int64  no-undo.
        
        if length(strData, 'raw':u) = 0 then
            return 0.
            
        run gzputs in hZlib (gzFile, strData, output bytesWrite).  
        
        if bytesWrite = -1 then
            undo, throw new AppError('Write data error', 0).
            
        return bytesWrite.
        
    end method.
    
    method private memptr readFile (gzFile as int64, bufferSize as int64):
        define variable mpBuffer    as memptr   no-undo.
        define variable mpReturn    as memptr   no-undo.
        define variable bytesRead   as int64    no-undo.
        
        set-size(mpBuffer) = bufferSize.
        
        run gzread in hZlib (gzFile, get-pointer-value(mpBuffer), get-size(mpBuffer), output bytesRead).
        
        if bytesRead = -1 then
            undo, throw new AppError('Read data error', 0).
        
        mpReturn = get-bytes(mpBuffer, 1, bytesRead).
        
        return mpReturn.
        
        finally:
            set-size(mpBuffer) = 0 no-error.
        end finally.
    end method.
end class.
