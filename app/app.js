/**
 * Create the different modules.
 * The pimaticApp module is the main module.
 * The pimaticApp.devices module contains device specific controllers or directives.
 */
angular.module('pimaticApp.devices', []);
angular.module('pimaticApp.settings', []);
angular.module('pimaticApp', ['ngMaterial', 'ngRoute', 'ngMessages', 'pimaticApp.devices', 'pimaticApp.settings']);

/**
 * The hostname of the device running the pimatic API. Leave empty if the pimatic API is running on the same machine.
 */
angular.module('pimaticApp').constant('pimaticHost', '');

/**
 * The name of the service to use as API Provider. This makes it possible to change the API used, or use fixtures instead.
 */
angular.module('pimaticApp').constant('apiProviderName', 'apiProvider');

angular.module('pimaticApp').config(function ($routeProvider) {
    $routeProvider.when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
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
        redirectTo: '/home'
    });
});

angular.module('pimaticApp').run(function ($rootScope, $location, $injector, store, auth, apiProviderName) {
    $rootScope.store = store;
    $rootScope.auth = auth;

    var apiProvider = $injector.get(apiProviderName);
    apiProvider.init(store, auth);

    // register listener to watch route changes
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if (!auth.isLoggedIn()) {
            // no logged user, we should be going to #login
            if (next.originalPath == "/login") {
                // already going to #login, no redirect needed
            } else {
                // not going to #login, we should redirect now
                console.log('pimaticApp', 'Redirecting to login...');
                auth.setRedirectedFrom(next.originalPath);
                $location.path("/login");
            }
        }
    });
});


angular.module('pimaticApp').config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('green')
        .accentPalette('indigo');
});