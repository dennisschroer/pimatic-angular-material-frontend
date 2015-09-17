angular.module('pimaticApp').factory('toast', ['$mdToast', function ($mdToast) {
    return {
        show: function (message) {
            $mdToast.show($mdToast.simple().content(message));
        },

        error: function (message) {
            $mdToast.show($mdToast.simple().content(message));
        },

        deviceActionDone: function (device, action) {
            this.show('Done: ' + action + ' ' + device.id);
        },

        deviceActionFail: function (device, action) {
            this.error('Fail: ' + action + ' ' + device.id);
        }
    };
}]);