angular.module('pimaticApp').controller('HomeController', [
    '$scope',
    '$filter',
    'utils',
    'store',
    function ($scope, $filter, utils, store) {
        $scope.selectedTab = 0;
        $scope.getUngroupedDeviceIds = utils.getUngroupedDeviceIds;

        /**
         * Get the ids of the device which are on the given page and in the given group.
         * If group is undefined, the ids of the ungrouped devices will be returned.
         * @param page The page displayed
         * @param group The group to display
         * @returns array A list of device ids
         */
        $scope.getDeviceIds = function (page, group) {
            if (angular.isUndefined(group)) {
                return $filter('intersect')($filter('extract')(page.devices, 'deviceId'), $scope.getUngroupedDeviceIds());
            } else {
                return $filter('intersect')($filter('extract')(page.devices, 'deviceId'), group.devices);
            }
        };

        $scope.getPages = function () {
            return store.get('pages');
        };

        $scope.getGroups = function () {
            return store.get('groups');
        };

        $scope.getDevice = function (deviceId) {
            return store.get('devices', deviceId)
        };
    }
]);
