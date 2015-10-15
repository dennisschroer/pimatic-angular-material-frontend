angular.module('pimaticApp').config(['$translateProvider', function($translateProvider) {
    var translations = {
        // App words
        UNGROUPED: 'Ungrouped',

        // Device words
        LOW_BATTERY: 'Low battery',
        NOT_SYNCED: 'Not synced',
        PRESET: 'Preset',
        MODE: 'Mode',
        ECO: 'Eco',
        COMFY: 'Comfy',
        AUTO: 'Auto',
        MANUAL: 'Manual',
        BOOST: 'Boost',
        UP: 'Up',
        DOWN: 'Down',
        START: 'Start',
        STOP: 'Stop',
        RESET: 'Reset'
    };

    $translateProvider.translations('en-US', translations).preferredLanguage('en-US');
}]);