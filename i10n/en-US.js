angular.module('pimaticApp').config(['$translateProvider', function($translateProvider) {
    var translations = {
        // App words
        UNGROUPED: 'Ungrouped',

        // Action names (usually on buttons)
        'ACTION.SAVE': 'Save',
        'ACTION.CANCEL': 'Cancel',
        'ACTION.DELETE': 'Delete',
        'ACTION.YES': 'Yes',
        'ACTION.NO': 'No',

        // Labels for forms
        'LABEL.ID': 'Id',
        'LABEL.NAME': 'Name',

        // Validation messages
        'MESSAGE.ID_PATTERN': 'Only lowercase alphanumeric characters, \'-\' and \'_\'',
        'MESSAGE.REQUIRED': 'Required',

        // Dialog messages
        'DIALOG.CONFIRM_REMOVE_GROUP': 'Are you sure you want to delete this group?',

        // Page title
        'TITLE.HOME': 'Home',
        'TITLE.ABOUT': 'About',
        'TITLE.LOGIN': 'Login',
        'TITLE.GROUPS': 'Groups',
        'TITLE.GROUPS_CREATE': 'Create group',
        'TITLE.GROUPS_EDIT': 'Edit group',
        'TITLE.DEVICES': 'Devices',
        'TITLE.PAGES': 'Pages',
        'TITLE.PAGES_CREATE': 'Create page',
        'TITLE.PAGES_EDIT': 'Edit page',

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