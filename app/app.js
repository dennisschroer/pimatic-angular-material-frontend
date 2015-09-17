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

angular.module('pimaticApp.devices', []);
angular.module('pimaticApp.settings', []);
angular.module('pimaticApp.data', ['pimaticApp.configuration']);
angular.module('pimaticApp', ['ngMaterial', 'ngRoute', 'ngMessages', 'pimaticApp.configuration', 'pimaticApp.devices', 'pimaticApp.settings', 'pimaticApp.data']);


angular.module('pimaticApp').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
    }).when('/landing', {
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
        templateUrl: 'partials/settings/devices.html',
        controller: 'DevicesController'
    }).otherwise({
        redirectTo: '/landing'
    });
}]);

angular.module('pimaticApp').run(["$rootScope", "$location", "$injector", "store", "auth", "apiProviderName", function ($rootScope, $location, $injector, store, auth, apiProviderName) {
    $rootScope.store = store;
    $rootScope.auth = auth;

    $rootScope.state = 'starting';
    $rootScope.redirectedFrom = null;

    $rootScope.setState = function(state){
        $rootScope.state = state;
        if(state == 'done'){
            if($rootScope.redirectedFrom !== null){
                $location.path(this.redirectedFrom);
                $rootScope.redirectedFrom = null;
            }else{
                $location.path("home");
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
                console.log('App', 'Application is loading, redirecting to the landing page');
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
                    console.log('pimaticApp', 'Redirecting to login...');
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