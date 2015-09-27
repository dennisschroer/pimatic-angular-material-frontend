angular.module('pimaticApp').config(['$translateProvider', function($translateProvider) {
    var translations = {
        UNGROUPED: 'Ungrouped'
    };

    $translateProvider.translations('en-US', translations).preferredLanguage('en-US');
}]);