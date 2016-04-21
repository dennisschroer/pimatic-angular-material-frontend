angular.module('pimaticApp.devices').controller('TimerController', [
    '$scope',
    'store',
    'events',
    function ($scope, store, events) {
        $scope.start = function () {
            var action = 'startTimer';
            store.adapter.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };

        $scope.stop = function () {
            var action = 'stopTimer';
            store.adapter.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };

        $scope.reset = function () {
            var action = 'resetTimer';
            store.adapter.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };
    }
]);
