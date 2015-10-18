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
angular.module('pimaticApp.configuration').constant('apiName', 'websocketApi');
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
angular.module('pimaticApp.api', ['pimaticApp.configuration']);
angular.module('pimaticApp.services', ['pimaticApp.api', 'pimaticApp.configuration']);

/** The main module */
angular.module('pimaticApp', [
    'ngMaterial',
    'ngRoute',
    'ngMessages',
    'pimaticApp.configuration',
    'pimaticApp.devices',
    'pimaticApp.services',
    'pimaticApp.settings',
    'pascalprecht.translate',
    'mdThemeColors'
]);


angular.module('pimaticApp').config(['$routeProvider', '$logProvider', '$injector', 'debug', function ($routeProvider, $logProvider, $injector, debug) {
    // Setup routes
    $routeProvider
    // == Main pages ==
    .when('/home', {
        title: 'TITLE.HOME',
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
    }).when('/landing', {
    }).when('/about', {
        title: 'TITLE.ABOUT',
        templateUrl: 'partials/about.html'
    }).when('/login', {
        title: 'TITLE.LOGIN',
        templateUrl: 'partials/login.html',
        controller: 'LoginController'
    }).when('/home/:pageId', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'

    // == Settings ==
    // Groups
    }).when('/settings/groups', {
        title: 'TITLE.GROUPS',
        templateUrl: 'partials/settings/groups/index.html',
        controller: 'GroupsController'
    }).when('/settings/groups/create', {
        title: 'TITLE.GROUPS_CREATE',
        templateUrl: 'partials/settings/groups/create.html',
        controller: 'GroupsCreateController'
    }).when('/settings/groups/:id', {
        title: 'TITLE.GROUPS_EDIT',
        templateUrl: 'partials/settings/groups/edit.html',
        controller: 'GroupsEditController'
    // Devices
    }).when('/settings/devices', {
        title: 'TITLE.DEVICES',
        templateUrl: 'partials/settings/devices/index.html',
        controller: 'DevicesController'
    // Pages
    }).when('/settings/pages', {
        title: 'TITLE.PAGES',
        templateUrl: 'partials/settings/pages/index.html',
        controller: 'PagesController'
    }).when('/settings/pages/create', {
        title: 'TITLE.PAGES_CREATE',
        templateUrl: 'partials/settings/pages/create.html',
        controller: 'PagesCreateController'
    }).when('/settings/pages/:id', {
        title: 'TITLE.PAGES_EDIT',
        templateUrl: 'partials/settings/pages/edit.html',
        controller: 'PagesEditController'

    // == Default page ==
    }).otherwise({
        redirectTo: '/landing'
    });

    debug = debug != 'false';
    $logProvider.debugEnabled(debug);
}]);

angular.module('pimaticApp.services').config(['storeProvider', 'apiName', function(storeProvider, apiName){
    storeProvider.setApi(apiName);
}]);

angular.module('pimaticApp').run(["$rootScope", "$location", "$injector", "$log", "store", "auth", "version", function ($rootScope, $location, $injector, $log, store, auth, version) {
    // Store and auth are globally available
    $rootScope.store = store;
    $rootScope.auth = auth;

    // Version
    $rootScope.version = version == '@@version' ? 'development' : version;

    // Initialize variables
    $rootScope.pageTitle = null;
    $rootScope.state = 'starting';
    $rootScope.redirectedFrom = null;

    $rootScope.setState = function (state) {
        $rootScope.state = state;
        // The state is changed, so we need to redirect the user
        if (state == 'done' || state == 'unauthenticated') {
            if (!angular.isUndefined($rootScope.redirectedFrom) && $rootScope.redirectedFrom !== null) {
                $location.path($rootScope.redirectedFrom);
                $log.debug('New state:', state, 'Redirecting to ', $rootScope.redirectedFrom);
                $rootScope.redirectedFrom = null;
            } else {
                $log.debug('New state:', state, 'Redirecting to ', state == 'unauthenticated' ? '/login' : '/home');
                $location.path(state == 'unauthenticated' ? '/login' : '/home');
            }
        }
    };

    // Start the store
    store.reload();

    // register listener to watch route changes
    $rootScope.$on("$routeChangeStart", function (event, next/*, current*/) {
        // If the app is starting, we redirect to the landing page
        if ($rootScope.state == 'starting') {
            if (next.originalPath != "/landing") {
                $log.debug('App', 'Application is loading, redirecting to the landing page');
                $rootScope.redirectedFrom = next.originalPath;
                $location.path("/landing");
            }
        // The app is not starting, so it is known whether the user is logged in or not.
        } else {
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

    // Change the page title if the route is changed
    $rootScope.$on('$routeChangeSuccess', function (event, current) {
        $rootScope.pageTitle = current.$$route.title;
    });
}]);


angular.module('pimaticApp').config(["$mdThemingProvider", function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('orange');
}]);