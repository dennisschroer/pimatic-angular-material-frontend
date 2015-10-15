angular.module('pimaticApp.settings').controller('DevicesController', ["$scope", "utils", function ($scope, utils) {
    $scope.getUngroupedDeviceIds = utils.getUngroupedDeviceIds;
}]);