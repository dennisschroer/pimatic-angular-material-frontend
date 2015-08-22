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


    $scope.$on('deviceAttributeChange', function (event, attribute, newVal, oldVal) {
        if (attribute.name == 'state') {
            store.provider.deviceAction($scope.device.id, newVal ? 'turnOn' : 'turnOff').then(function () {
            }, function () {
                // Reset value
                attribute.$skipUpload = true;
                attribute.value = oldVal;
                //event.preventDefault();
            });
        }

    });
});