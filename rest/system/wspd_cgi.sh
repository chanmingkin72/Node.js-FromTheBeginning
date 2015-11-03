#!/bin/sh

#/**************************************************************/
#/* Copyright (c) 1997 by Progress Software Corporation        */
#/*                                                            */
#/* All rights reserved.  No part of this program or document  */
#/* may be  reproduced in  any form  or by any means without  */
#/* permission in writing from Progress Software Corporation.  */
#/**************************************************************/
#
# WebSpeed CGI Messenger startup script - UNIX Version

# This is a sample of the CGI-based WebSpeed Messenger 
# (cgiip) startup script for UNIX. The two environment
# variables: DLC, PROMSGS must be defined for cgiip to 
# operate properly. Normally, this shell script
# would reside in the Web Server's scripts directory (e.g. cgi-bin)
# and would be specified in a URL, for example:
#  http://hostName/cgi-bin/wspd_cgi.sh/web/src/examples/runscrpt.w
#
# The cgiip executable can be started in a number of ways:
#
#  1. cgiip <host_name> <port_number>
#      where: host_name/port_number is the location of a WebSpeed 
#             Broker or Dispatcher service, this is WebSpeed v1.0 
#             compatibility.
#
#  2. cgiip -i <WS_service>
#      where: WS_service is a WebSpeed Broker or Dispatcher service 
#             as defined in the WebSpeed property file 
#             $DLC/ubroker.properties
#
#  3. cgiip
#             Started with no arguments. This instructs cgiip to use
#             the default service (defaultService) as defined in the
#             WebSpeed property file $DLC/ubroker.properties
#
#  4. cgiip -f <properties file>
#             Started with a specific property file, this overrides the 
#             default property file ($DLC/ubroker.properties). If 
#             -i <WS_service> is specified that service name in 
#             the <properties file> will be used. If -i <WS_service> 
#            is not specified then the default service
#             (defaultService) must be set in <properties files>.
#
# Determine the correct directory where the Messenger 
# is installed from either the tailored name or existing value of $DLC.
for what_dlc in "$DLC" "/usr/dlc"
do
    [ ! -f "${what_dlc}/bin/cgiip" ] && continue
    DLC=$what_dlc
    export DLC
    break
done

# Set PROMSGS (if not set)
PROMSGS=${PROMSGS-$DLC/promsgs};                export PROMSGS

# Set the user working directory - this is a tailored value
WRKDIR=${WRKDIR-"/usr/wrk"};                export WRKDIR

# option 1 using host_name and port_num
# $DLC/bin/cgiip pegasus 5001

# option 2 using a service name defined in $DLC/ubroker.properties
$DLC/bin/cgiip -i wsbroker1

# option 3 the "defaultService" defined in $DLC/ubroker.properties
# $DLC/bin/cgiip 

# option 4 using a specific properties file name
# $DLC/bin/cgiip -i wsbroker1 -f ./mybroker.properties

# option 5 using a specific properties file name with the "defaultService"
# $DLC/bin/cgiip -f ./mybroker.properties


