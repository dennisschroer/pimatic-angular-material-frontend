angular.module('pimaticApp.devices').controller('SwitchController', function ($scope, store, toast) {
    $scope.updateValue = function (attribute) {
        var action = attribute.value ? 'turnOn' : 'turnOff';

        store.provider.deviceAction($scope.device.id, action).then(function () {
            toast.deviceActionDone($scope.device, action);
        }, function () {
            // Reset value
            attribute.value = !attribute.value;
            toast.deviceActionFail($scope.device, action);
        });
    };
});