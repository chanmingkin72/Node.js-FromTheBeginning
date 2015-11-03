var socket  	= io();

(function() {
	"use strict";

	var app = angular.module( "demoApp", [ 
				"ct.ui.router.extras", 
				"ui.bootstrap", 
				"angular.filter", 
				"ui.select",
				"kendo.directives"
			]);

	app

	// ********************************************************************************
	// now $state is available in all controllers
	.run( [ "$rootScope", "$state", "$stateParams", "$templateCache", "$stickyState", "$http", function ( $rootScope, $state, $stateParams, $templateCache, $stickyState, $http ) {
		var log 	= debug("opti:run"),
			deflang	= navigator.language || navigator.userLanguage;
		
		log( "start", $state );
	    $rootScope.$state 		= $state;
	    $rootScope.$stateParams	= $stateParams;
		$rootScope.actLang		= deflang.split("-")[0];
		$rootScope.lang			= {};

	}])
	
	// ********************************************************************************
	// router
	.config( [ "$stateProvider", "$urlRouterProvider", function( $stateProvider, $urlRouterProvider ) {
		var log = debug("demo:router");

		$urlRouterProvider.otherwise('default');

		$stateProvider

			// Default
			.state('default', {
				url: '/default',
				templateUrl: "/model/welcome.html"
			})

			// WebSpeed
			.state( 'webspeed', {
				url: '/webspeed',
				templateUrl: "/model/customer.html",
				controller: "wsCtrl"
			})

			// Smart Component Library
			.state( 'scl', {
				url: '/scl',
				templateUrl: "/model/customer.html",
				controller: "sclCtrl"
			})

			// JSDO
			.state( 'jsdo', {
				url: '/jsdo',
				templateUrl: "/model/customer.html",
				controller: "jsdoCtrl"
			})

			// Akera
			.state( 'akera', {
				url: '/akera',
				templateUrl: "/model/customer.html",
				controller: "akeraCtrl"
			})

			// JSDO
			.state( 'n4p', {
				url: '/node4progress',
				templateUrl: "/model/customer.html",
				controller: "n4pCtrl"
			});
	
	}])
	
	// ********************************************************************************
	// Menu
	.controller( "menuCtrl", [ "$scope", function( $scope ) {
		var log = debug("demo:menu");

        $scope.newItem      = false;

        $scope.menu         = [
                {
                    name:       "webspeed",
                    title:      "WebSpeed"
                },
                {
                    name:       "scl",
                    title:      "Smart Component Library"
                },
                {
                    name:       "jsdo",
                    title:      "Progress JSDO"
                },
                {
                    name:       "akera",
                    title:      "Akera.io"
                },
                {
                    name:       "n4p",
                    title:      "node4progress"
                }
            ];

        $scope.openMenu     = function( elm ) {
            log( "menu", elm.name );
            
            $scope.selected     = elm;
            
            $scope.$state.go( elm.name );
        };
	}])    
	
    //*****************************************************************
    // WebSpeed controller
	.controller( "wsCtrl", [ "$scope", function( $scope ) {
        var log             = debug("demo:wsCtrl");
	
	    $scope.title        = "WebSpeed";
        $scope.transport    = "/data/webspeed/customer?result=ttCust";
	}])

    //*****************************************************************
    // Smart Component Library controller
	.controller( "sclCtrl", [ "$scope", function( $scope ) {
        var log             = debug("demo:wsCtrl");
	
	    $scope.title        = "Smart Component Library";
        $scope.transport    = "/data/scl/customer?ds=dsCustomer&table=eCustomer";
	}])

    //*****************************************************************
    // JSDO controller
	.controller( "jsdoCtrl", [ "$scope", function( $scope ) {
        var log             = debug("demo:jsdoCtrl");
	
	    $scope.title        = "Progress JSDO";
        $scope.transport    = "/data/jsdo/customer";
	}])

    //*****************************************************************
    // Akera
	.controller( "akeraCtrl", [ "$scope", function( $scope ) {
        var log             = debug("demo:akeraCtrl");
	
	    $scope.title        = "Akera";
        $scope.transport    = "/data/akera/customer";
	}])

    //*****************************************************************
    // node4progress
	.controller( "n4pCtrl", [ "$scope", function( $scope ) {
        var log             = debug("demo:n4pCtrl");
	
	    $scope.title        = "node4progress";
        $scope.transport    = "/data/node4progress/customer";
	}])

    //*****************************************************************
    // Grid controller
	.controller( "gridCtrl", [ "$scope", function( $scope ) {
        var log             = debug("demo:gridCtrl");
	
        $scope.custGridOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: $scope.transport
                },
                pageSize: 10,
                serverPaging: false,
                serverSorting: false
            },
            sortable: true,
            pageable: true,
            dataBound: function() {
                this.expandRow(this.tbody.find("tr.k-master-row").first());
            },
            columns: [
                {
                    field: "CustNum",
                    title: "Cust Id.",
                    width: "80px"
                },
                {
                    field: "Name",
                    title: "Name",
                    width: "150px"
                },
                {
                    field: "SalesRep"
                },
                {
                    field: "Phone"
                },
                {
                    field: "Country"
                },
                {
                    field: "State"
                },
                {
                    field: "PostalCode",
                    title: "ZIP",
                    width: "50px"
                },
                {
                    field: "City"
                },
                {
                    field: "Address"
                },
                {
                    field: "Address2"
                }
            ]
        };
        
	}])

    //*****************************************************************
    // SCL layout controller
	.controller( "layoutCtrl", [ "$scope", "$http", "$timeout", function( $scope, $http, $timeout ) {
        var log             = debug("demo:slc:layoutCtrl");

        // get layout specific definitions from server
        $http
            .get( "http://demo.consultingwerkcloud.com/SmartJsdoBackendService/rest/SmartJsdoBackendService/SmartViews/Layout/" + $scope.$state.current.name )
            .then( function(result) {
                
                // save result in actual scope   
                $scope.sclstruct    = _.indexBy( result.data.Elements, "InstanceId" );
                $scope.layout       = _.groupBy( result.data.Elements, "Type" );

                // get menu object
                $scope.menu         = $scope.$state.menu[ $scope.$state.current.name ];

                // define selected record for each datasources
                _.each( $scope.layout.DataSource, function( item, index ) {
                    $scope[ "ds" + item.InstanceId ]   = {};
                });
                
                // // set all viewer urls
                // $scope.viewer       = [];
                // _.each( $scope.layout.Viewer, function( item, index ) {
                //     $scope.viewer.push( 'http://demo.consultingwerkcloud.com/cgi-bin/cgiip.exe/WService=SmartWeb/SmartViewer/' + item.Layout + '?scope=ds' + item.DataSourceId);
                // });
                
                $timeout( function() {
                    $scope.$broadcast( "scl:loaded" );
                });
            });
	}])
	
	//*****************************************************************
    // SCL grid
	.directive( "sclGrid", [ "$http", "$timeout", function( $http, $timeout ) {
        var log             = debug("demo:scl:gridDirective");
	    
	    return {
	        restrict:   "A",
	        link:       function( scope, element, attr ) {
                var dataSource,
                    gridOpt;
                
                log( "start" );
                
                function allLoaded() {
                    log( "checkload", dataSource && scope.Grid);
                    if (dataSource && gridOpt) {
                        scope.gridOpt   = _.extend( gridOpt, { 
                            dataSource: dataSource,
                            change:     function(e) {
                                var rec     = this.select()[0];
                                scope[ "ds" + scope.grid.DataSourceId ]     = this.dataItem(rec);
                                scope.$digest();
                            }
                        } );
                    }
                }
                
                // watch for datasource
                scope.$on( "scl:datasource:ready", function( event, elm ) {
                    log( "ready", elm.instance );
                    
                    // check if it's my instance
                    if (elm.instance == scope.grid.DataSourceId) {
                        dataSource  = elm.dataSource;
                        allLoaded();
                    }
                });

                // we have to wait until structure has been loaded to get our values
                scope.$on( "scl:loaded", function() {
                    log( "loaded", attr.sclGrid );

                    scope.grid      = scope.sclstruct[ attr.sclGrid ];
                    
                    // get grid definition
                    $http
                        .get( "http://demo.consultingwerkcloud.com/SmartJsdoBackendService/rest/SmartJsdoBackendService/SmartViews/" + scope.sclstruct[ attr.sclGrid ].Layout )
                        .then( function( result ) {
                            log( "gridOpt" );
                            
                            gridOpt   = result.data;
                            
                            $timeout( function() {
                                allLoaded();
                            });
                        });
                });
	        }
	    };
        
    }]);

})();