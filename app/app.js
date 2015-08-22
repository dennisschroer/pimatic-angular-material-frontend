/**
 * Create the different modules.
 * The pimaticApp module is the main module.
 * The pimaticApp.devices module contains device specific controllers or directives.
 */
angular.module('pimaticApp.devices', []);
angular.module('pimaticApp', ['ngMaterial', 'ngRoute', 'pimaticApp.devices']);

/**
 * The hostname of the device running the pimatic API
 */
angular.module('pimaticApp').constant('pimaticHost', 'http://192.168.1.218');

/**
 * If true, the app will uses fixtures as responses on API calls, instead of calling the API
 */
angular.module('pimaticApp').constant('apiProvider', 'fixtureProvider');

angular.module('pimaticApp').config(function ($routeProvider) {
    $routeProvider.when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
    }).when('/home/:pageId', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
    }).otherwise({
        redirectTo: '/home'
    });


});


angular.module('pimaticApp').config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('green')
        .accentPalette('indigo');
});