/**
 * Create the different modules.
 * The pimaticApp module is the main module.
 * The pimaticApp.devices module contains device specific controllers or directives.
 */
angular.module('pimaticApp.configuration', []);
angular.module('pimaticApp.devices', []);
angular.module('pimaticApp.settings', []);
angular.module('pimaticApp.adapters', ['pimaticApp.configuration']);
angular.module('pimaticApp.services', ['pimaticApp.adapters', 'pimaticApp.configuration']);

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
