angular.module('pimaticApp.devices').controller('DimmerController', ["$scope", "store", "events", function ($scope, store, events) {
    $scope.updateDimlevel = function (attribute) {
        var action = 'changeDimlevelTo';

        store.api.deviceAction($scope.device.id, action, {'dimlevel': attribute.value}).then(function () {
            events.onDeviceActionDone($scope.device, action, {'dimlevel': attribute.value});
        }, function () {
            // Reset value
            events.onDeviceActionFail($scope.device, action, {'dimlevel': attribute.value});
            attribute.value = !attribute.value;
        });
    };
}]);
