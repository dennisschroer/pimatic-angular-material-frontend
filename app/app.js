/**
 * Create the different modules.
 * The pimaticApp module is the main module.
 * The pimaticApp.devices module contains device specific controllers or directives.
 */
angular.module('pimaticApp.devices', []);
angular.module('pimaticApp.settings', []);
angular.module('pimaticApp', ['ngMaterial', 'ngRoute', 'ngMessages', 'pimaticApp.devices', 'pimaticApp.settings']);

/**
 * The hostname of the device running the pimatic API
 */
angular.module('pimaticApp').constant('pimaticHost', 'http://localhost:8080');

/**
 * If true, the app will uses fixtures as responses on API calls, instead of calling the API
 */
angular.module('pimaticApp').constant('apiProvider', 'apiProvider');

angular.module('pimaticApp').config(function ($routeProvider) {
    $routeProvider.when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
    }).when('/home/:pageId', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
    }).when('/settings/groups', {
        templateUrl: 'views/settings/groups/index.html',
        controller: 'GroupsController'
    }).when('/settings/groups/create', {
        templateUrl: 'views/settings/groups/create.html',
        controller: 'GroupsCreateController'
    }).when('/settings/groups/:id', {
        templateUrl: 'views/settings/groups/edit.html',
        controller: 'GroupsEditController'
    }).when('/settings/devices', {
        templateUrl: 'views/settings/devices.html',
        controller: 'DevicesController'
    }).otherwise({
        redirectTo: '/home'
    });


});


angular.module('pimaticApp').config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('green')
        .accentPalette('indigo');
});