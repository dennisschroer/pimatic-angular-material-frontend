angular.module('pimaticApp.services').factory('toast', [
    '$mdToast',
    function ($mdToast) {
        return {
            show: function (message) {
                $mdToast.show($mdToast.simple().content(message));
            },

            error: function (message) {
                $mdToast.show($mdToast.simple().content(message));
            }
        };
    }
]);
