angular.module('pimaticApp.services').factory('events', [
    'toast',
    function (toast) {
        return {
            onDeviceActionDone: function (device, action/*, params*/) {
                toast.show('Succesfully performed "' + action + '" on ' + device.id);
            },

            onDeviceActionFail: function (device, action/*, params*/) {
                toast.error('Failed to perform "' + action + '" on ' + device.id);
            }
        };
    }
]);
