angular.module('pimaticApp.services').factory('utils', ['store', function (store) {
    return {
        /**
         * Get a list of ids of devices which are not in a group
         * @return array An array containing the ids of the devices which are not in a group
         */
        getUngroupedDeviceIds: function () {
            var groups = store.get('groups');
            var devices = store.get('devices');

            var ungrouped = [];

            // First add all ids
            angular.forEach(devices, function (value) {
                ungrouped.push(value.id);
            });

            // Remove ids of devices which are in a group
            angular.forEach(groups, function (group) {
                angular.forEach(group.devices, function (deviceId) {
                    var index = ungrouped.indexOf(deviceId);
                    if (index >= 0) {
                        ungrouped.splice(index, 1);
                    }
                });
            });

            // Return the result
            return ungrouped;
        }
    };
}]);