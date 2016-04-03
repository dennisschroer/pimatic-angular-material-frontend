/**
 * Create the different modules.
 * The pimaticApp module is the main module.
 * The pimaticApp.devices module contains device specific controllers or directives.
 */
angular.module('pimaticApp.configuration', []);
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

angular.module('pimaticApp').run(["$rootScope", "$location", "$injector", "$log", "store", "auth", "version", function ($rootScope, $location, $injector, $log, store, auth, version) {
    $rootScope.store = store;
    $rootScope.auth = auth;
    // Version
    $rootScope.version = version == '@@version' ? 'development' : version;

    $rootScope.state = 'starting';
    $rootScope.redirectedFrom = null;

    $rootScope.setState = function (state) {
        $rootScope.state = state;
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

    // Initialize the apiProvider, so that it can make callbacks
    //var apiProvider = $injector.get(apiProviderName);
    //apiProvider.init(store, auth);

    // Start the store
    store.reload();

    // register listener to watch route changes
    $rootScope.$on("$routeChangeStart", function (event, next/*, current*/) {
        if ($rootScope.state == 'starting') {
            if (next.originalPath != "/landing") {
                $log.debug('App', 'Application is loading, redirecting to the landing page');
                $rootScope.redirectedFrom = next.originalPath;
                $location.path("/landing");
            }
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
}]);