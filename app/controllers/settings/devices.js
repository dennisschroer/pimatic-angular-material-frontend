angular.module('pimaticApp.settings').controller('DevicesController', ['$scope', 'utils', 'store', function ($scope, utils, store) {
    $scope.getUngroupedDeviceIds = utils.getUngroupedDeviceIds;

    $scope.getGroups = function () {
        return store.get('grpups');
    };

    $scope.getDevice = function (deviceId) {
        return store.get('devices', deviceId)
    };
}]);
