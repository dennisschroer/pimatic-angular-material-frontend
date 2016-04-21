angular.module('pimaticApp.devices').controller('SwitchController', ['$scope', 'store', 'events', function ($scope, store, events) {
    $scope.updateValue = function (attribute) {
        var action = attribute.value ? 'turnOn' : 'turnOff';

        store.api.deviceAction($scope.device.id, action).then(function () {
            events.onDeviceActionDone($scope.device, action);
        }, function () {
            // Reset value
            attribute.value = !attribute.value;
            events.onDeviceActionFail($scope.device, action);
        });
    };
}]);
