/**
 * Create the different modules.
 * The pimaticApp module is the main module.
 * The pimaticApp.devices module contains device specific controllers or directives.
 */
angular.module('pimaticApp.configuration', []);

/**
 * The hostname of the device running the pimatic API. Leave empty if the pimatic API is running on the same machine.
 */
angular.module('pimaticApp.configuration').constant('pimaticHost', '');
/**
 * The name of the service to use as API Provider. This makes it possible to change the API used, or use fixtures instead.
 */
angular.module('pimaticApp.configuration').constant('apiProviderName', 'apiProvider');
/**
 * If debug is true, debug messages will be
 */
//angular.module('pimaticApp.configuration').constant('debug', true);
/**
 * The title of the application.
 */
//angular.module('pimaticApp.configuration').constant('title', 'Pimatic Material');

angular.module('pimaticApp.devices', []);
angular.module('pimaticApp.settings', []);
angular.module('pimaticApp.data', ['pimaticApp.configuration']);
angular.module('pimaticApp', ['ngMaterial', 'ngRoute', 'ngMessages', 'pimaticApp.configuration', 'pimaticApp.devices', 'pimaticApp.settings', 'pimaticApp.data']);


angular.module('pimaticApp').config(['$routeProvider', '$logProvider', 'debug', function ($routeProvider, $logProvider, debug) {
    $routeProvider.when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
    }).when('/landing', {
    }).when('/about', {
        templateUrl: 'partials/about.html'
    }).when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginController'
    }).when('/home/:pageId', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
    }).when('/settings/groups', {
        templateUrl: 'partials/settings/groups/index.html',
        controller: 'GroupsController'
    }).when('/settings/groups/create', {
        templateUrl: 'partials/settings/groups/create.html',
        controller: 'GroupsCreateController'
    }).when('/settings/groups/:id', {
        templateUrl: 'partials/settings/groups/edit.html',
        controller: 'GroupsEditController'
    }).when('/settings/devices', {
        templateUrl: 'partials/settings/devices/index.html',
        controller: 'DevicesController'
    }).otherwise({
        redirectTo: '/landing'
    });

    debug = debug != 'false';
    $logProvider.debugEnabled(debug);
}]);

angular.module('pimaticApp').run(["$rootScope", "$location", "$injector", "$log", "store", "auth", function ($rootScope, $location, $injector, $log, store, auth, title) {
    $rootScope.store = store;
    $rootScope.auth = auth;
    // Version
    $rootScope.version = '@@version';
    if($rootScope.version.substr(0,2) == '@@'){
        $rootScope.version = 'dev';
    }

    $rootScope.state = 'starting';
    $rootScope.redirectedFrom = null;

    $rootScope.setState = function(state){
        $rootScope.state = state;
        if(state == 'done' || state == 'unauthenticated'){
            if(!angular.isUndefined($rootScope.redirectedFrom) && $rootScope.redirectedFrom !== null){
                $location.path($rootScope.redirectedFrom);
                $log.debug('New state:', state, 'Redirecting to ', $rootScope.redirectedFrom);
                $rootScope.redirectedFrom = null;
            }else{
                $log.debug('New state:', state, 'Redirecting to ', state=='unauthenticated' ? '/login' : '/home');
                $location.path(state=='unauthenticated' ? '/login' : '/home');
            }
        }
    };

    // Initialize the apiProvider, so that it can make callbacks
    //var apiProvider = $injector.get(apiProviderName);
    //apiProvider.init(store, auth);

    // Start the store
    store.reload();

    // register listener to watch route changes
    $rootScope.$on("$routeChangeStart", function (event, next/*, current*/) {
        if($rootScope.state == 'starting'){
            if (next.originalPath != "/landing") {
                $log.debug('App', 'Application is loading, redirecting to the landing page');
                $rootScope.redirectedFrom = next.originalPath;
                $location.path("/landing");
            }
        }else{
            if (!auth.isLoggedIn()) {
                // no logged user, we should be going to #login
                if (next.originalPath == "/login") {
                    // already going to #login, no redirect needed
                } else {
                    // not going to #login, we should redirect now
                    $log.debug('pimaticApp', 'Redirecting to login...');
                    $rootScope.redirectedFrom = next.originalPath;
                    $location.path("/login");
                }
            }
        }

    });
}]);


angular.module('pimaticApp').config(["$mdThemingProvider", function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('orange');
}]);