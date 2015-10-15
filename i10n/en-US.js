angular.module('pimaticApp').config(['$translateProvider', function($translateProvider) {
    var translations = {
        UNGROUPED: 'Ungrouped',
        LOW_BATTERY: 'Low battery',
        NOT_SYNCED: 'Not synced',
        PRESET: 'Preset',
        MODE: 'Mode'
    };

    $translateProvider.translations('en-US', translations).preferredLanguage('en-US');
}]);