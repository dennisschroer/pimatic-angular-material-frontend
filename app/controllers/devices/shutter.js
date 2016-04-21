angular.module('pimaticApp.devices').controller('ShutterController', [
    '$scope',
    'store',
    'events',
    function ($scope, store, events) {
        $scope.moveUp = function () {
            var attribute = $scope.getAttribute('position');
            var action = attribute.value == 'up' ? 'stop' : 'moveUp';

            store.api.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };

        $scope.moveDown = function () {
            var attribute = $scope.getAttribute('position');
            var action = attribute.value == 'down' ? 'stop' : 'moveDown';

            store.api.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };
    }
]);
