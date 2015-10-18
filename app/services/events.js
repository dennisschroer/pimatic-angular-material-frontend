angular.module('pimaticApp.services').factory('events', ['toast', function (toast) {
    return {
        onDeviceActionDone: function (device, action/*, params*/) {
            toast.show('Done: ' + action + ' ' + device.id);
        },

        onDeviceActionFail: function (device, action/*, params*/) {
            toast.error('Fail: ' + action + ' ' + device.id);
        },

        onStoreAdditionSuccess: function(type, object){
            toast.show('Added: ' + type + ' ' + object.id);
        },

        onStoreAdditionFailure: function (type, object, message) {
            toast.error('Failed to add ' + type + ': ' + message);
        },

        onStoreRemovalSuccess: function(type, object){
            toast.show('Removed: ' + type + ' ' + object.id);
        },

        onStoreRemovalFailure: function (type, object, message) {
            toast.error('Failed to remove ' + type + ': ' + message);
        }
    };
}]);