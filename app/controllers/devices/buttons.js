angular.module('pimaticApp.devices').controller('ButtonsController', [
    '$scope',
    'store',
    'events',
    function ($scope, store, events) {
        $scope.buttonPressed = function (button) {
            var action = 'buttonPressed';
            store.adapter.deviceAction($scope.device.id, action, {'buttonId': button.id}).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };
    }
]);
