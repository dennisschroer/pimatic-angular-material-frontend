angular.module('pimaticApp.services').factory('events', [
    'toast',
    function (toast) {
        return {
            onDeviceActionDone: function (device, action/*, params*/) {
                toast.show('Done: ' + action + ' ' + device.id);
            },

            onDeviceActionFail: function (device, action/*, params*/) {
                toast.error('Fail: ' + action + ' ' + device.id);
            }
        };
    }
]);
